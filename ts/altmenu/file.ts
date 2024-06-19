import { SEP_ITEM } from "$state/Desktop/ts/store";
import { spawnApp } from "$ts/apps";
import { ShutdownIcon } from "$ts/images/power";
import { DownloadFile } from "$ts/server/fs/download";
import { readFile } from "$ts/server/fs/file";
import { ProcessStack } from "$ts/stores/process";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "../runtime";

export function FileMenu(runtime: Runtime): ContextMenuItem {
  return {
    caption: "File",
    subItems: [
      {
        caption: "New Window",
        icon: "add",
        action() {
          spawnApp("FileManager", 0, [runtime.path.get()]);
        },
      },
      {
        caption: "Refresh",
        icon: "refresh",
        async action() {
          await runtime.refresh();
        },
      },
      SEP_ITEM,
      {
        caption: "Upload",
        icon: "upload",
        action(window, data) {
          ProcessStack.dispatch.dispatchToPid(runtime.pid, "upload-file", data.path);
        },
      },
      {
        caption: "Download",
        icon: "download",
        disabled: () => runtime.selected.get().length !== 1,
        async action() {
          const file = await readFile(runtime.selected.get()[0]);

          DownloadFile(file);
        },
      },
      SEP_ITEM,
      {
        caption: "Exit",
        image: ShutdownIcon,
        action() {
          runtime.closeApp();
        },
      },
    ],
  };
}
