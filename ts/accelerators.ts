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
        if (runtime.renamer.get()) return;

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
        if (runtime.renamer.get()) return;

        const selected = runtime.selected.get();

        if (selected.length !== 1) return;

        runtime.renamer.set(selected[0]);
      }
    },
    {
      key: "arrowdown",
      action() {
        if (runtime.renamer.get()) return;

        runtime.selectorDown();
      }
    },
    {
      key: "arrowup",
      action() {
        if (runtime.renamer.get()) return;

        runtime.selectorUp();
      }
    },
    {
      key: "enter",
      shift: true,
      action() {
        if (runtime.renamer.get()) return;

        runtime.EnterKey(true)
      }
    },
    {
      key: "enter",
      action() {
        if (runtime.renamer.get()) return;

        runtime.EnterKey()
      }
    }
  ]
}