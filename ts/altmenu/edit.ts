import { SEP_ITEM } from "$state/Desktop/ts/store";
import { TrashIcon } from "$ts/images/general";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "../runtime";

export function EditMenu(runtime: Runtime): ContextMenuItem {
  return {
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
  }
}