import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon } from "$ts/images/dialog";
import { TrashIcon } from "$ts/images/general";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { GetConfirmation, createErrorDialog } from "$ts/process/error";
import { deleteItem, deleteMultiple } from "$ts/server/fs/delete";
import { createDirectory, getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { fileUpload, multipleFileUpload } from "$ts/server/fs/upload";
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
  public loading = Store<boolean>(true);
  public failed = Store<boolean>(false);
  private _refreshLocked = false;

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this._init();
  }

  /**
   * Initializes the rest of the Runtime and its listeners
   */
  private async _init() {
    const args = this.process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";

    this.process.accelerator.store.push(...FileManagerAccelerators(this))
    await this.navigate(path);
    this.assignDispatchers();
    this.createSystemFolders();
  }

  /**
   * Navigates the current instance to the provided path
   * @param path The full path to navigate to
   */
  public async navigate(path: string) {
    this.path.set(path);

    await this.refresh();

    this.appMutator.update((v) => {
      v.metadata.name = `File Manager - ${pathToFriendlyName(path)}`;

      return v;
    })
  }

  /**
   * Refreshes the directory contents by getting them from the filesystem
   */
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

  /**
   * Contacts the ArcOS File APIs to open the file with another process or handler.
   * @param file The file to open
   */
  public async openFile(file: PartialArcFile) {
    console.log(file);//TODO
  }

  /**
   * Navigates to the parent directory.
   */
  public async parentDir() {
    const current = this.path.get();
    const parent = getParentDirectory(current);

    if (parent == current) return;

    return await this.navigate(parent);
  }

  /**
   * Replaces- or appends to the selection, or unselects an already selected item.
   * @param e The mouse event of the click
   * @param path The full path of the item to be selected
   */
  public updateSelection(e: MouseEvent, path: string) {
    if (!e.shiftKey) return this.selected.set([path]);

    const selected = this.selected.get();

    if (selected.includes(path)) selected.splice(selected.indexOf(path), 1);
    else selected.push(path);

    this.selected.set(selected)

    return;
  }

  /**
   * Displays the Path Not Found dialog when a missing path is dispatched.
   * @param path The directory that's missing
   */

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

  /**
   * Selects all files in the current directory (Ctrl+A).
   */
  public selectAll() {
    const contents = this.contents.get();

    if (!contents) return;

    this.selected.set([
      ...contents.files.map((f) => f.scopedPath),
      ...contents.directories.map((d) => d.scopedPath)
    ])
  }

  /**
   * Prevents the File Manager from listening to `fs-flush`
   */
  public lockRefresh() {
    this._refreshLocked = true;
  }

  /**
   * Allows the File Manager to listen to `fs-flush` again
   * @param refresh Refresh the directory content also?
   */
  public unlockRefresh(refresh = true) {
    this._refreshLocked = false;

    if (refresh) this.refresh();
  }

  /**
   * Handles deleting the selected files (Delete key)
   */
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

    await deleteMultiple(selected);

    this.unlockRefresh();
    //TODO: Stop that progress indicator here
  }

  /**
   * Handles dropping files onto the DirectoryViewer component
   * @param e The drag event
   */
  public async dropFiles(e: DragEvent) {
    e.preventDefault();

    this.lockRefresh();
    //TODO: Add some kind of progress indicator here

    const target = this.path.get();

    await multipleFileUpload(e.dataTransfer.files, target)

    this.unlockRefresh();
    //TODO: Stop that progress indicator here
  }

  /**
   * Assigns subscriptions for filesystem flushing and change-dir
   */
  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", () => this.refresh());

    this.process.handler.dispatch.subscribe(this.process.pid, "change-dir", (data: string) => {
      if (typeof data === "string") this.navigate(data)
    })
  }

  /**
   * Creates the predefined directories if they don't exist.
   */
  private async createSystemFolders() {
    this.lockRefresh();

    const contents = this.contents.get();

    let createdAnything = false;

    if (!contents) throw new Error("TODO");

    const rootDirs = contents.directories.map((a) => `./${a.scopedPath}`);

    for (const { path } of SystemFolders) {
      if (rootDirs.includes(path)) continue;

      await createDirectory(path);

      createdAnything = true;
    }

    this.unlockRefresh(createdAnything);
  }
}