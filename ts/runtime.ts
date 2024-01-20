import { AppRuntime } from "$ts/apps/runtime";
import { Process } from "$ts/process";
import { GlobalDispatch } from "$ts/process/dispatch/global";
import { getParentDirectory, readDirectory } from "$ts/server/fs/dir";
import { pathExists, pathToFriendlyName } from "$ts/server/fs/util";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { PartialArcFile, UserDirectory } from "$types/fs";

export class Runtime extends AppRuntime {
  public path = Store<string>();
  public contents = Store<UserDirectory>()

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    const args = process.args;
    const path = args[0] && typeof args[0] == "string" ? args[0] : "./";

    this.navigate(path);
    this.assignDispatchers();
  }

  public async navigate(path: string) {
    const exists = await pathExists(path);

    if (!exists) return false;

    this.path.set(path);
    this.refresh();
    this.appMutator.update((v) => {
      v.metadata.name = `File Manager - ${pathToFriendlyName(path)}`;

      return v;
    })

    return true;
  }

  public async refresh() {
    const contents = await readDirectory(this.path.get());

    if (!contents) return false;

    this.contents.set(contents);

    console.log(contents);

    return true;
  }

  public async openFile(file: PartialArcFile) {
    console.log(file);//TODO
  }

  public async parentDir() {
    const parent = getParentDirectory(this.path.get());

    return await this.navigate(parent);
  }

  private assignDispatchers() {
    GlobalDispatch.subscribe("fs-flush", () => this.refresh());

    this.process.handler.dispatch.subscribe(this.process.pid, "change-dir", (data: string) => {
      if (typeof data === "string") this.navigate(data)
    })
  }
}