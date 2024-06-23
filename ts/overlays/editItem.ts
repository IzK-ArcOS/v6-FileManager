import EditItemSvelte from "$apps/FileManager/Overlays/EditItem.svelte";
import { ComponentIcon } from "$ts/images/general";
import { App } from "$types/app";
import { OverlayRuntime } from "./runtime";

export const EditItem: App = {
  metadata: {
    name: "Edit Item",
    description: "Create or rename a file",
    author: "ArcOS Team",
    version: "1.0.0",
    icon: ComponentIcon,
  },
  runtime: OverlayRuntime,
  size: { w: 380, h: 185 },
  minSize: { w: 380, h: 185 },
  maxSize: { w: 380, h: 185 },
  id: "EditItem",
  pos: { x: 0, y: 0 },
  state: {
    minimized: false,
    maximized: false,
    headless: false,
    fullscreen: false,
    resizable: false,
  },
  controls: { minimize: false, maximize: false, close: false },
  content: EditItemSvelte,
};
