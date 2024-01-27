import { AppKeyCombinations } from "$types/accelerator";
import { Runtime } from "./runtime";

/**
 * Gets the keyboard accelerators for the File Manager
 * @param runtime The File Manager Runtime
 * @returns File Manager key combinations
 */
export function FileManagerAccelerators(runtime: Runtime): AppKeyCombinations {
  return [
    {
      ctrl: true,
      key: "a",
      action() {
        if (runtime.renamer.get()) return;

        runtime.selectAll();
      }
    },
    {
      key: "escape",
      action() {
        const renamer = runtime.renamer.get();

        if (!renamer) return runtime.selected.set([]);

        runtime.renamer.set("");
      }
    },
    {
      alt: true,
      key: "arrowup",
      action() {
        runtime.parentDir();
      }
    },
    {
      key: "delete",
      action() {
        runtime.deleteSelected();
      }
    },
    {
      key: "r",
      alt: true,
      action() {
        runtime.refresh();
      }
    },
    {
      key: "f2",
      action() {
        const selected = runtime.selected.get();

        if (selected.length !== 1) return;

        runtime.renamer.set(selected[0]);
      }
    }
  ]
}