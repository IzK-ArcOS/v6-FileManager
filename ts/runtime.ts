import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon } from "$ts/images/dialog";
import { TrashIcon } from "$ts/images/general";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { GetConfirmation, createErrorDialog } from "$ts/process/error";
import { deleteItem } from "$ts/server/fs/delete";
import { createDirectory, getParentDirectory, readDirectory } from "$ts/server/fs/dir";
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
  private refreshLocked = false;

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    const args = process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";

    this.process.accelerator.store.push(...FileManagerAccelerators(this))
    this.navigate(path);
    this.assignDispatchers();
    this.createSystemFolders();
  }

  public async navigate(path: string) {
    this.path.set(path);
    this.refresh();
    this.appMutator.update((v) => {
      v.metadata.name = `File Manager - ${pathToFriendlyName(path)}`;

      return v;
    })

    return true;
  }

  public async refresh() {
    if (this.refreshLocked) return;

    this.contents.set(null);

    const contents = await readDirectory(this.path.get());

    if (!contents) {
      this.FileNotFoundError();

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

  public FileNotFoundError(path = this.path.get()) {
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

    for (const path of selected) {
      await deleteItem(path);
    }

    //TODO: Stop that progress indicator here
  }

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", () => this.refresh());

    this.process.handler.dispatch.subscribe(this.process.pid, "change-dir", (data: string) => {
      if (typeof data === "string") this.navigate(data)
    })
  }

  private async createSystemFolders() {
    this.refreshLocked = true;

    for (const { path } of SystemFolders) {
      await createDirectory(path)
    }

    this.refreshLocked = false;

    this.refresh();
  }
}