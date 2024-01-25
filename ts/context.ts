import { SEP_ITEM } from "$state/Desktop/ts/store";
import { TrashIcon } from "$ts/images/general";
import { getPartialFile } from "$ts/server/fs/file";
import { OpenWith } from "$ts/server/fs/file/handler";
import { FileHandlers } from "$ts/stores/filesystem/handlers";
import { ProcessStack } from "$ts/stores/process";
import { AppContextMenu, ContextMenuItem } from "$types/app";

function compileOpenWithMenu(): ContextMenuItem {
  const openWithMenu: ContextMenuItem = {
    caption: "Open With",
    subItems: [],
  };

  for (const handler of FileHandlers) {
    openWithMenu.subItems.push({
      caption: handler.name,
      image: handler.image,
      async action(_, data) {
        const partial = await getPartialFile(data.path);

        if (!partial) return;

        handler.handler(partial)
      }
    })
  }

  return openWithMenu;
}

export const FileManagerContextMenus: AppContextMenu = {
  "dirviewer-file": [
    {
      caption: "Open",
      async action(window, data) {
        const partial = await getPartialFile(data.path);

        if (!partial) return;

        OpenWith(partial, window.pid);
      }
    },
    compileOpenWithMenu(),
    SEP_ITEM,
    {
      caption: "Cut",
      icon: "content_cut",
      async action(window, data) {
        ProcessStack.dispatch.dispatchToPid(window.pid, "context-cut", data.path)
      }
    },
    {
      caption: "Copy",
      icon: "content_copy",
      async action(window, data) {
        ProcessStack.dispatch.dispatchToPid(window.pid, "context-copy", data.path)
      }
    },
    {
      caption: "Paste",
      icon: "content_paste",
      async action(window) {
        ProcessStack.dispatch.dispatchToPid(window.pid, "context-paste")
      }
    },
    SEP_ITEM,
    {
      caption: "Delete",
      image: TrashIcon,
      async action(window, data) {
        ProcessStack.dispatch.dispatchToPid(window.pid, "context-delete", data.path)
      }
    },
    {
      caption: "Rename",
      icon: "mode_edit",
      async action(window, data) {
        ProcessStack.dispatch.dispatchToPid(window.pid, "context-rename", data.path)
      }
    }
  ]
}