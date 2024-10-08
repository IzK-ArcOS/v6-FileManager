import { spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon, WarningIcon } from "$ts/images/dialog";
import { TrashIcon } from "$ts/images/general";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { GetConfirmation, createErrorDialog } from "$ts/process/error";
import { copyMultipleProgressy, renameMultipleProgressy } from "$ts/server/fs/copy/progress";
import { deleteMultipleProgressy } from "$ts/server/fs/delete/progress";
import { createDirectory, getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { OpenFile, OpenWith } from "$ts/server/fs/file/handler";
import { getFSQuota } from "$ts/server/fs/quota";
import { multipleFileUploadProgressy } from "$ts/server/fs/upload/progress";
import { pathToFriendlyName } from "$ts/server/fs/util";
import { defaultQuota } from "$ts/stores/quota";
import { UserDataStore } from "$ts/stores/user";
import { Plural } from "$ts/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { LogLevel } from "$types/console";
import { FSQuota, UserDirectory } from "$types/fs";
import { FileManagerAccelerators } from "./accelerators";
import { FileManagerAltMenu } from "./altmenu";
import { FileManagerDispatches, SystemFolders } from "./store";
import { FileManagerOverlays } from "./store/overlays";

export class Runtime extends AppRuntime {
  public path = Store<string>();
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

    this.newFolder.subscribe(() => {
      if (this.isVirtual()) this.newFolder.set(false);
    });
  }

  private async _init() {
    const args = this.process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";
    const selection = args[1] && typeof args[1] == "string" ? [args[1].replace("./", "")] : [];

    this.process.accelerator.store.push(...FileManagerAccelerators(this));

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
    this.selected.set([]);

    await this.refresh();

    this.setWindowTitle(pathToFriendlyName(path), false);
  }

  public async refresh() {
    if (this._refreshLocked) return;

    this.contents.set(undefined);
    this.loading.set(true);
    this.failed.set(false);

    const contents = await readDirectory(this.path.get());

    this.loading.set(false);

    if (!contents || !contents.scopedPath) {
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

  public isVirtual() {
    const contents = this.contents.get();

    return contents && contents.virtual;
  }

  public updateSelection(e: MouseEvent, path: string) {
    if (!e.shiftKey) return this.selected.set([path]);

    const selected = this.selected.get();

    if (selected.includes(path)) selected.splice(selected.indexOf(path), 1);
    else selected.push(path);

    this.selected.set(selected);

    return;
  }

  public FileNotFound(path = this.path.get()) {
    this.failed.set(true);

    createErrorDialog(
      {
        title: "Location not found",
        message: `Folder <code>${path}</code> does not exist on ArcOS.`,
        image: ErrorIcon,
        buttons: [
          {
            caption: "Go Home",
            action: () => {
              this.navigate("./");
            },
            suggested: true,
          },
        ],
      },
      this.pid,
      true
    );
  }

  public selectAll() {
    const contents = this.contents.get();

    if (!contents) return;

    this.selected.set([
      ...contents.files.map((f) => f.scopedPath),
      ...contents.directories.map((d) => d.scopedPath),
    ]);
  }

  public lockRefresh() {
    this._refreshLocked = true;
  }

  public unlockRefresh(refresh = true) {
    this._refreshLocked = false;

    if (refresh) this.refresh();
  }

  public async deleteSelected() {
    if (this.isVirtual()) return;

    const selected = this.selected.get();

    if (!selected.length) return;

    const title =
      selected.length > 1
        ? `Delete ${selected.length} ${Plural("item", selected.length)}?`
        : `Delete ${pathToFriendlyName(selected[0])}?`;

    const proceed = await GetConfirmation(
      {
        title: title,
        message: `Are you sure you want to <b>permanently</b> delete the selected ${Plural(
          "item",
          selected.length
        )} from your account? There's no going back!`,
        image: TrashIcon,
      },
      this.pid,
      true
    );

    if (!proceed) return;

    this.lockRefresh();

    await deleteMultipleProgressy(selected, this.pid);

    this.unlockRefresh();
  }

  public async dropFiles(e: DragEvent) {
    e.preventDefault();

    if (this.isVirtual()) return;

    this.lockRefresh();

    const target = this.path.get();
    await multipleFileUploadProgressy(e.dataTransfer.files, target, this.pid);

    this.unlockRefresh();
  }

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", async () => {
      this.quota.set(await getFSQuota());
      this.refresh();
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
    if (this.isVirtual()) return;

    this.copyList.set(files || []);
    this.cutList.set([]);
  }

  public setCutFiles(files = this.selected.get()) {
    if (this.isVirtual()) return;

    this.cutList.set(files || []);
    this.copyList.set([]);
  }

  public async pasteFiles(target = this.path.get()) {
    if (this.isVirtual()) return;

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
    const showHidden = UserDataStore.get().sh.showHiddenFiles;
    const paths = [
      ...dir.directories.filter((a) => !!a.hidden == showHidden).map((a) => a.scopedPath),
      ...dir.files.filter((a) => !!a.hidden == showHidden).map((a) => a.scopedPath),
    ];
    const index = paths.indexOf(selected);

    if (!selected) this.selected.set([paths[0]]);

    const path = paths[index < 0 || index - 1 < 0 ? paths.length - 1 : index - 1];

    this.selected.set([path]);
  }

  public selectorDown() {
    this.singlefySelected();

    const selected = this.selected.get()[0];
    const dir = this.contents.get();
    const showHidden = UserDataStore.get().sh.showHiddenFiles;
    const paths = [
      ...dir.directories.filter((a) => !!a.hidden == showHidden).map((a) => a.scopedPath),
      ...dir.files.filter((a) => !!a.hidden == showHidden).map((a) => a.scopedPath),
    ];
    const index = paths.indexOf(selected);

    if (!selected) this.selected.set([paths[0]]);

    const path = paths[index < 0 || index + 1 > paths.length - 1 ? 0 : index + 1];

    this.selected.set([path]);
  }

  public isDirectory(path: string) {
    const dir = this.contents.get();

    return dir.directories.map((a) => a.scopedPath).includes(path);
  }

  public getFile(path: string) {
    if (this.isDirectory(path)) return null;

    return this.contents.get().files.filter((a) => a.scopedPath == path)[0];
  }

  public async EnterKey(alternative = false) {
    // this.singlefySelected();

    const paths = this.selected.get();

    if (alternative && paths.length > 1) {
      createErrorDialog(
        {
          title: "Can't do that",
          message:
            "It is not possible to use <code>Shift</code>+<code>Enter</code> on multiple items. Please select a single item, or press <code>Enter</code> without <code>Shift</code>.",
          image: ErrorIcon,
          buttons: [{ caption: "Okay", action() {}, suggested: true }],
        },
        this.pid,
        true
      );

      return;
    }

    if (paths.length > 1) {
      const continueOperation = await GetConfirmation(
        {
          title: "Hold up!",
          message:
            "You're about to open multiple items at the same time. This could cause unexpected behaviour, depending on the number of files. Continue?",
          image: WarningIcon,
          sound: "arcos.dialog.warning",
        },
        this.pid,
        true
      );

      if (!continueOperation) return;
    }

    for (const path of paths) {
      if (!path) continue;

      const isDir = this.isDirectory(path);

      if (isDir) {
        if (!alternative) await this.navigate(path);
        else await spawnApp("FileManager", 0, [path]);

        continue;
      }

      const file = this.getFile(path);

      if (!file) continue;

      if (alternative) await OpenWith(file, this.pid, true);
      else await OpenFile(file);
    }
  }

  public async createEmptyFile() {
    if (this.isVirtual()) return;

    this.showOverlay("EditItem", [this.path.get()]);
  }

  public async renameItem(filename: string) {
    if (this.isVirtual()) return;

    this.showOverlay("EditItem", [this.path.get(), filename]);
  }

  public showOverlay(id: string, args: any[] = []) {
    this.Log(`Showing overlay ${id} (${args.length} arguments)`);

    const overlay = FileManagerOverlays[id];

    if (!overlay) {
      this.Log(
        `Can't show non-existent overlay ${id}. This is a bug.`,
        `showOverlay`,
        LogLevel.error
      );
      return false;
    }

    spawnOverlay(overlay, this.process.pid, args);

    return true;
  }
}
