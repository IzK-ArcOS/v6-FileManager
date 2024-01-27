import { SEP_ITEM } from "$state/Desktop/ts/store";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "../runtime";
import { SystemFolders } from "../store";

export function GoMenu(runtime: Runtime): ContextMenuItem {

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

  return {
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

}