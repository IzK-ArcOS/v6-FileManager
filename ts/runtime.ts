import { AppRuntime } from "$ts/apps/runtime";
import { ErrorIcon } from "$ts/images/dialog";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { createErrorDialog } from "$ts/process/error";
import { getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { pathExists, pathToFriendlyName } from "$ts/server/fs/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { PartialArcFile, UserDirectory } from "$types/fs";

export class Runtime extends AppRuntime {
  public path = Store<string>();
  public contents = Store<UserDirectory>();
  public selected = Store<string[]>([]);

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    const args = process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";

    this.navigate(path);
    this.assignDispatchers();
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

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", () => this.refresh());

    this.process.handler.dispatch.subscribe(this.process.pid, "change-dir", (data: string) => {
      if (typeof data === "string") this.navigate(data)
    })
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
}