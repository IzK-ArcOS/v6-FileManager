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
        runtime.selectAll();
      }
    },
    {
      key: "escape",
      action() {
        runtime.selected.set([]);
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
    }
  ]
}