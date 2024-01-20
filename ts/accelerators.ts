import { deleteItem } from "$ts/server/fs/delete";
import { AppKeyCombinations } from "$types/accelerator";
import { Runtime } from "./runtime";

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
    }
  ]
}