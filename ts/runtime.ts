import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon } from "$ts/images/dialog";
import { TrashIcon } from "$ts/images/general";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { GetConfirmation, createErrorDialog } from "$ts/process/error";
import { copyMultiple, renameMultiple } from "$ts/server/fs/copy";
import { copyMultipleProgressy, renameMultipleProgressy } from "$ts/server/fs/copy/progress";
import { deleteMultiple } from "$ts/server/fs/delete";
import { deleteMultipleProgressy } from "$ts/server/fs/delete/progress";
import { createDirectory, getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { multipleFileUpload } from "$ts/server/fs/upload";
import { multipleFileUploadProgressy } from "$ts/server/fs/upload/progress";
import { pathToFriendlyName } from "$ts/server/fs/util";
import { Plural } from "$ts/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { PartialArcFile, UserDirectory } from "$types/fs";
import { FileManagerAccelerators } from "./accelerators";
import { SystemFolders } from "./store";

export class Runtime extends AppRuntime {
  public path = Store<string>();
  public contents = Store<UserDirectory>();
  public selected = Store<string[]>([]);
  public cutList = Store<string[]>([]);
  public copyList = Store<string[]>([]);
  public loading = Store<boolean>(true);
  public failed = Store<boolean>(false);
  private _refreshLocked = false;

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this._init();
  }

  private async _init() {
    const args = this.process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";

    this.process.accelerator.store.push(...FileManagerAccelerators(this))
    await this.navigate(path);
    this.assignDispatchers();
    this.createSystemFolders();
  }

  public async navigate(path: string) {
    this.path.set(path);

    await this.refresh();

    this.setWindowTitle(pathToFriendlyName(path), true)
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

  public async openFile(file: PartialArcFile) {
    console.log(file);//TODO
  }

  public async parentDir() {
    const current = this.path.get();
    const parent = getParentDirectory(current);

    if (parent == current) return;

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

    //TODO: Add some kind of progress indicator here
    this.lockRefresh();

    await deleteMultipleProgressy(selected);

    this.unlockRefresh();
    //TODO: Stop that progress indicator here
  }

  public async dropFiles(e: DragEvent) {
    e.preventDefault();

    this.lockRefresh();
    //TODO: Add some kind of progress indicator here

    const target = this.path.get();

    await multipleFileUploadProgressy(e.dataTransfer.files, target)

    this.unlockRefresh();
    //TODO: Stop that progress indicator here
  }

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", () => this.refresh());

    this.process.handler.dispatch.subscribe(this.process.pid, "change-dir", (data: string) => {
      if (typeof data === "string") this.navigate(data)
    })
  }

  private async createSystemFolders() {
    const contents = this.contents.get();

    if (!contents) throw new Error("TODO");

    if (contents.scopedPath != "./") return;

    this.lockRefresh();

    let createdAnything = false;

    const rootDirs = contents.directories.map((a) => `./${a.scopedPath}`);

    for (const { path } of SystemFolders) {
      if (rootDirs.includes(path)) continue;

      await createDirectory(path);

      createdAnything = true;
    }

    this.unlockRefresh(createdAnything);
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

    await renameMultipleProgressy(cutObj);
    await copyMultipleProgressy(copyObj);

    this.copyList.set([]);
    this.cutList.set([]);

    this.unlockRefresh();
  }
}