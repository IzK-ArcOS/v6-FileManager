import { getFilenameFromPath } from "$ts/server/fs/file";
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
      },
    },
    {
      key: "escape",
      action() {
        return runtime.selected.set([]);
      },
    },
    {
      alt: true,
      key: "arrowup",
      action() {
        runtime.parentDir();
      },
    },
    {
      key: "delete",
      action() {
        runtime.deleteSelected();
      },
    },
    {
      key: "r",
      alt: true,
      action() {
        runtime.refresh();
      },
    },
    {
      key: "f2",
      action() {
        const selected = runtime.selected.get();

        if (selected.length !== 1) return;

        runtime.renameItem(getFilenameFromPath(selected[0]));
      },
    },
    {
      key: "arrowdown",
      action() {
        runtime.selectorDown();
      },
    },
    {
      key: "arrowup",
      action() {
        runtime.selectorUp();
      },
    },
    {
      key: "enter",
      shift: true,
      action() {
        runtime.EnterKey(true);
      },
    },
    {
      key: "enter",
      action() {
        runtime.EnterKey();
      },
    },
  ];
}
