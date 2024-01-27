import { UserDataStore } from "$ts/stores/user";
import { ContextMenuItem } from "$types/app";

export function ViewMenu(): ContextMenuItem {
  return {
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
  }
}