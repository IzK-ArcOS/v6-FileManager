import { AppRuntime } from "$ts/apps";
import { Process } from "$ts/process";
import { App, AppMutator } from "$types/app";

export class OverlayRuntime extends AppRuntime {
  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    process.accelerator.store.push({
      key: "escape",
      action: () => {
        this.closeApp();
      },
    });
  }
}
