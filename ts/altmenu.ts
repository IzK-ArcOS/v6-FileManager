import { SEP_ITEM } from "$state/Desktop/ts/store";
import { spawnApp } from "$ts/apps";
import { TrashIcon } from "$ts/images/general";
import { ShutdownIcon } from "$ts/images/power";
import { DownloadFile } from "$ts/server/fs/download";
import { readFile } from "$ts/server/fs/file";
import { directUploadProgressy } from "$ts/server/fs/upload/progress";
import { UserDataStore } from "$ts/stores/user";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "./runtime";
import { SystemFolders } from "./store";

export function FileManagerAltMenu(runtime: Runtime): ContextMenuItem[] {
  const folderItems: ContextMenuItem[] = [];

  for (const folder of SystemFolders) {
    folderItems.push({
      caption: folder.name,
      image: folder.icon,
      async action() {
        await runtime.navigate(folder.path)
      }
    })
  }

  return [
    {
      caption: "File",
      subItems: [
        {
          caption: "New Window",
          icon: "add",
          action() {
            spawnApp("FileManager", 0, [runtime.path.get()])
          }
        },
        {
          caption: "Refresh",
          icon: "refresh",
          async action() {
            await runtime.refresh()
          }
        },
        SEP_ITEM,
        {
          caption: "Upload...",
          icon: "upload",
          async action() {
            directUploadProgressy(runtime.path.get(), true, runtime.pid);
          }
        },
        {
          caption: "Download",
          icon: "download",
          disabled: () => runtime.selected.get().length !== 1,
          async action() {
            const file = await readFile(runtime.selected.get()[0]);

            DownloadFile(file);
          }
        },
        SEP_ITEM,
        {
          caption: "Exit",
          image: ShutdownIcon,
          action() {
            runtime.closeApp()
          }
        }
      ],
    },
    {
      caption: "Edit",
      subItems: [
        {
          caption: "New Folder",
          icon: "create_new_folder",
          action() {
            runtime.newFolder.set(true);
          },
        },
        SEP_ITEM,
        {
          caption: "Cut",
          icon: "content_cut",
          disabled: () => !runtime.selected.get().length,
          async action() {
            runtime.setCutFiles()
          }
        },
        {
          caption: "Copy",
          icon: "content_copy",
          disabled: () => !runtime.selected.get().length,
          async action() {
            runtime.setCopyFiles()
          }
        },
        {
          caption: "Paste",
          icon: "content_paste",
          disabled: () => !runtime.copyList.get().length && !runtime.cutList.get().length,
          async action() {
            await runtime.pasteFiles();
          }
        },
        SEP_ITEM,
        {
          caption: "Delete",
          image: TrashIcon,
          disabled: () => !runtime.selected.get().length,
          async action() {
            await runtime.deleteSelected();
          }
        },
        {
          caption: "Rename",
          icon: "mode_edit",
          disabled: () => runtime.selected.get().length !== 1,
          async action() {
            runtime.renamer.set(runtime.selected.get()[0]);
          }
        },
        SEP_ITEM,
        {
          caption: "Select All",
          icon: "select_all",
          action() {
            runtime.selectAll();
          }
        }
      ]
    },
    {
      caption: "View",
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
        }
      ],
    },
    {
      caption: "Go",
      subItems: [
        {
          caption: "Parent Folder",
          icon: "arrow_upward",
          async action() {
            await runtime.parentDir()
          },
        },
        SEP_ITEM,
        ...folderItems
      ]
    }
  ]
}