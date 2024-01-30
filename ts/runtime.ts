import { spawnApp } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon } from "$ts/images/dialog";
import { TrashIcon } from "$ts/images/general";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { GetConfirmation, createErrorDialog } from "$ts/process/error";
import { copyMultipleProgressy, renameMultipleProgressy } from "$ts/server/fs/copy/progress";
import { deleteItem } from "$ts/server/fs/delete";
import { deleteMultipleProgressy } from "$ts/server/fs/delete/progress";
import { createDirectory, getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { OpenFile, OpenWith } from "$ts/server/fs/file/handler";
import { getFSQuota } from "$ts/server/fs/quota";
import { multipleFileUploadProgressy } from "$ts/server/fs/upload/progress";
import { pathToFriendlyName } from "$ts/server/fs/util";
import { defaultQuota } from "$ts/stores/quota";
import { Plural } from "$ts/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { FSQuota, UserDirectory } from "$types/fs";
import { FileManagerAccelerators } from "./accelerators";
import { FileManagerAltMenu } from "./altmenu";
import { FileManagerDispatches, SystemFolders } from "./store";

export class Runtime extends AppRuntime {
  public path = Store<string>();
  public renamer = Store<string>("");
  public contents = Store<UserDirectory>();
  public selected = Store<string[]>([]);
  public cutList = Store<string[]>([]);
  public copyList = Store<string[]>([]);
  public loading = Store<boolean>(true);
  public failed = Store<boolean>(false);
  public newFolder = Store<boolean>(false);
  public starting = Store<boolean>(true);
  public quota = Store<FSQuota>(defaultQuota);
  private _refreshLocked = false;

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this._init();
  }

  private async _init() {
    const args = this.process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";
    const selection = args[1] && typeof args[1] == "string" ? [args[1].replace("./", "")] : [];

    this.process.accelerator.store.push(...FileManagerAccelerators(this))

    await this.createSystemFolders();
    await this.navigate(path);
    this.quota.set(await getFSQuota());
    this.loadAltMenu(...FileManagerAltMenu(this));
    this.assignDispatchers();
    this.selected.set(selection);

    this.starting.set(false);
  }

  public async navigate(path: string) {
    const cwd = this.path.get();

    if (cwd == path) return;

    this.path.set(path);

    await this.refresh();

    await this.checkNewfileRemains();

    this.setWindowTitle(pathToFriendlyName(path), false)
  }

  public async refresh() {
    if (this._refreshLocked) return;

    this.contents.set(undefined);
    this.loading.set(true);
    this.failed.set(false);

    const contents = await readDirectory(this.path.get());

    this.loading.set(false);

    if (!contents) {
      this.FileNotFound();

      return false;
    }

    this.contents.set(contents);
    this.selected.set([]);

    return true;
  }

  public async parentDir() {
    const current = this.path.get();
    const parent = getParentDirectory(current);

    if (parent == current || this.loading.get()) return;

    return await this.navigate(parent);
  }

  public updateSelection(e: MouseEvent, path: string) {
    if (!e.shiftKey) return this.selected.set([path]);

    const selected = this.selected.get();

    if (selected.includes(path)) selected.splice(selected.indexOf(path), 1);
    else selected.push(path);

    this.selected.set(selected)

    return;
  }

  public FileNotFound(path = this.path.get()) {
    this.failed.set(true);

    createErrorDialog({
      title: "Location not found",
      message: `Folder <code>${path}</code> does not exist on ArcFS.`,
      image: ErrorIcon,
      buttons: [{
        caption: "Go Home", action: () => {
          this.navigate("./")
        }, suggested: true
      }]
    }, this.pid, true)
  }

  public selectAll() {
    const contents = this.contents.get();

    if (!contents) return;

    this.selected.set([
      ...contents.files.map((f) => f.scopedPath),
      ...contents.directories.map((d) => d.scopedPath)
    ])
  }

  public lockRefresh() {
    this._refreshLocked = true;
  }

  public unlockRefresh(refresh = true) {
    this._refreshLocked = false;

    if (refresh) this.refresh();
  }

  public async deleteSelected() {
    const selected = this.selected.get();

    if (!selected.length) return;

    const title = selected.length > 1 ? `Delete ${selected.length} ${Plural("item", selected.length)}?` : `Delete ${pathToFriendlyName(selected[0])}?`;

    const proceed = await GetConfirmation({
      title: title,
      message: `Are you sure you want to <b>permanently</b> delete the selected ${Plural("item", selected.length)} from your account? There's no going back!`,
      image: TrashIcon
    }, this.pid, true);

    if (!proceed) return;

    this.lockRefresh();

    await deleteMultipleProgressy(selected, this.pid);

    this.unlockRefresh();
  }

  public async dropFiles(e: DragEvent) {
    e.preventDefault();

    this.lockRefresh();

    const target = this.path.get();
    await multipleFileUploadProgressy(e.dataTransfer.files, target, this.pid)

    this.unlockRefresh();
  }

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", async () => {
      this.quota.set(await getFSQuota())
      this.refresh()
    });

    const dispatchers = FileManagerDispatches(this);

    for (const event in dispatchers) {
      const dispatcher = dispatchers[event];

      this.process.handler.dispatch.subscribe(this.pid, event, dispatcher);
    }
  }

  private async createSystemFolders() {
    const contents = await readDirectory("./");

    this.lockRefresh();

    const rootDirs = contents.directories.map((a) => `./${a.scopedPath}`);

    for (const { path } of SystemFolders) {
      if (rootDirs.includes(path) || path == "./") continue;

      await createDirectory(path);
    }

    this.unlockRefresh(false);
  }

  public setCopyFiles(files = this.selected.get()) {
    this.copyList.set(files);
    this.cutList.set([]);
  }

  public setCutFiles(files = this.selected.get()) {
    this.cutList.set(files);
    this.copyList.set([]);
  }

  public async pasteFiles(target = this.path.get()) {
    const copyList = this.copyList.get();
    const cutList = this.cutList.get();
    const copyObj = {};
    const cutObj = {};

    if (!copyList.length && !cutList.length) return;

    this.lockRefresh();

    for (const path of copyList) {
      copyObj[path] = target;
    }

    for (const path of cutList) {
      cutObj[path] = target;
    }

    await renameMultipleProgressy(cutObj, this.pid);
    await copyMultipleProgressy(copyObj, this.pid);

    this.copyList.set([]);
    this.cutList.set([]);

    this.unlockRefresh();
  }

  public singlefySelected() {
    const selected = this.selected.get();

    if (!selected.length) return;

    this.selected.set([selected[selected.length - 1]]);
  }

  public selectorUp() {
    this.singlefySelected();

    const selected = this.selected.get()[0];
    const dir = this.contents.get();
    const paths = [
      ...dir.directories.map((a) => a.scopedPath),
      ...dir.files.map((a) => a.scopedPath)
    ];
    const index = paths.indexOf(selected);

    if (!selected) this.selected.set([paths[0]])

    this.selected.set([paths[(index < 0 || index - 1 < 0) ? paths.length - 1 : index - 1]]);
  }

  public selectorDown() {
    this.singlefySelected();

    const selected = this.selected.get()[0];
    const dir = this.contents.get();
    const paths = [
      ...dir.directories.map((a) => a.scopedPath),
      ...dir.files.map((a) => a.scopedPath)
    ];
    const index = paths.indexOf(selected);

    if (!selected) this.selected.set([paths[0]])

    this.selected.set([paths[(index < 0 || index + 1 > paths.length - 1) ? 0 : index + 1]]);
  }

  public isDirectory(path: string) {
    const dir = this.contents.get();

    return dir.directories.map((a) => a.scopedPath).includes(path)
  }

  public getFile(path: string) {
    if (this.isDirectory(path)) return null;

    return this.contents.get().files.filter((a) => a.scopedPath == path)[0];
  }

  public async EnterKey(alternative = false) {
    this.singlefySelected();

    const selected = this.selected.get()[0];

    if (!selected) return;

    const isDir = this.isDirectory(selected);

    if (isDir) {
      if (!alternative) await this.navigate(selected);
      else spawnApp("FileManager", 0, [selected])

      return;
    }

    const file = this.getFile(selected);

    if (!file) return;

    if (alternative) OpenWith(file, this.pid, true)
    else await OpenFile(file)
  }

  public async checkNewfileRemains() {
    const contents = this.contents.get();

    if (!contents) return;

    const files = contents.files.filter((a) => a.filename.includes("$new"));
    const renamer = this.renamer.get();

    let deletedAnything = false;

    for (const file of files) {
      if (renamer == file.scopedPath) continue;

      deletedAnything = await deleteItem(file.scopedPath, false);
    }

    if (deletedAnything) {
      await this.refresh();

      GlobalDispatch.dispatch("fs-flush");
    }
  }
}