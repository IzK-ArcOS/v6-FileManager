import { SEP_ITEM } from "$state/Desktop/ts/store";
import { FolderIcon } from "$ts/images/filesystem";
import { TrashIcon } from "$ts/images/general";
import { ProcessStack } from "$ts/stores/process";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "../runtime";

export function EditMenu(runtime: Runtime): ContextMenuItem {
  return {
    caption: "Edit",
    subItems: [
      {
        caption: "Create Folder",
        image: FolderIcon,
        action(window) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "new-folder");
        },
      },
      SEP_ITEM,
      {
        caption: "Cut",
        icon: "content_cut",
        async action(window, data) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "context-cut", data.path);
        },
      },
      {
        caption: "Copy",
        icon: "content_copy",
        async action(window, data) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "context-copy", data.path);
        },
      },
      {
        caption: "Paste",
        icon: "content_paste",
        async action(window) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "context-paste");
        },
      },
      SEP_ITEM,
      {
        caption: "Delete",
        image: TrashIcon,
        async action(window, data) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "context-delete");
        },
      },
      {
        caption: "Rename",
        icon: "mode_edit",
        async action(window, data) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "context-rename", data.path);
        },
      },
      SEP_ITEM,
      {
        caption: "Select All",
        icon: "select_all",
        action() {
          runtime.selectAll();
        },
      },
    ],
  };
}
