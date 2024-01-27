import { SEP_ITEM } from "$state/Desktop/ts/store";
import { FileIcon, FolderIcon } from "$ts/images/filesystem";
import { TrashIcon, UploadIcon } from "$ts/images/general";
import { getPartialFile, writeFile } from "$ts/server/fs/file";
import { OpenWith } from "$ts/server/fs/file/handler";
import { directUploadProgressy } from "$ts/server/fs/upload/progress";
import { pathToFriendlyPath } from "$ts/server/fs/util";
import { FileHandlers } from "$ts/stores/filesystem/handlers";
import { ProcessStack } from "$ts/stores/process";
import { UserDataStore } from "$ts/stores/user";
import { sleep } from "$ts/util";
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
  ],
  "dirviewer": [{
    caption: "View",
    icon: "visibility",
    subItems: [
      {
        caption: "List",
        icon: "format_list_bulleted",
        isActive: () => !UserDataStore.get().appdata.FileManager.grid as boolean,
        action() {
          UserDataStore.update((v) => {
            v.appdata.FileManager.grid = false;

            return v;
          });
        }
      },
      {
        caption: "Grid",
        icon: "grid_on",
        isActive: () => UserDataStore.get().appdata.FileManager.grid as boolean,
        action() {
          UserDataStore.update((v) => {
            v.appdata.FileManager.grid = true;

            return v;
          });
        }
      },

    ],

  },
  {
    caption: "Refresh",
    icon: "refresh",
    async action(window) {
      ProcessStack.dispatch.dispatchToPid(window.pid, "refresh")
    }
  },
    SEP_ITEM,
  {
    caption: "Cut",
    icon: "content_cut",
    async action(window) {
      ProcessStack.dispatch.dispatchToPid(window.pid, "context-cut")
    }
  },
  {
    caption: "Copy",
    icon: "content_copy",
    async action(window) {
      ProcessStack.dispatch.dispatchToPid(window.pid, "context-copy")
    }
  },
  {
    caption: "Copy folder path",
    icon: "content_copy",
    async action(_, data) {
      navigator.clipboard.writeText(data.path)
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
    caption: "Add",
    subItems: [
      {
        caption: "Empty file",
        image: FileIcon,
        async action(window, data) {
          const id = Math.floor(Math.random() * 1e3);
          const blob = new Blob();
          const filename = `${data.path}/Empty File (${id}).new`.replaceAll("//", "/");

          await writeFile(filename, blob);

          await sleep(100);

          ProcessStack.dispatch.dispatchToPid(window.pid, "context-rename", pathToFriendlyPath(filename))
        }
      },
      {
        caption: "Folder",
        image: FolderIcon,
        action(window) {
          ProcessStack.dispatch.dispatchToPid(window.pid, "new-folder")
        }
      },
      SEP_ITEM,
      {
        caption: "Upload",
        image: UploadIcon,
        action(window, data) {
          directUploadProgressy(data.path, true, window.pid);
        }
      }
    ]
  }]
}