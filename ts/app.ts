import { SafeMode } from "$state/Desktop/ts/store";
import { FileManagerIcon } from "$ts/images/apps";
import { App } from "$types/app";
import AppSvelte from "../App.svelte";
import { FileManagerContextMenus } from "./context";
import { Runtime } from "./runtime";

export const FileManager: App = {
  metadata: {
    name: "File Manager",
    description: "Manage your ArcFS files",
    author: "The ArcOS Team",
    version: "2.0.0",
    icon: FileManagerIcon,
    dependendsOn: ["FsProgress", "OpenWith"],
  },
  runtime: Runtime,
  content: AppSvelte,
  id: "FileManager",
  size: { w: 800, h: 600 },
  minSize: { w: 650, h: 520 },
  maxSize: { w: 1400, h: 800 },
  pos: { x: 120, y: 60 },
  state: {
    minimized: false,
    maximized: false,
    headless: true,
    fullscreen: false,
    resizable: true,
  },
  controls: {
    minimize: true,
    maximize: true,
    close: true,
  },
  glass: true,
  contextMenu: FileManagerContextMenus,
  acceleratorDescriptions: {
    "ctrl+a": "Select all items in the folder",
    "alt+up": "Go to the parent directory",
    "alt+r": "Reload the directory",
    f2: "Rename the item (if there's only one selected)",
    enter: "Open file or navigate to folder",
    "shift+enter": "Launch Open With menu for a file, or open a folder in a new window",
    esc: "Clear the current selection",
    del: "Delete the currently selected items",
    up: "Move selection up using the keyboard",
    down: "Move selection down using the keyboard",
  },
  loadCondition: () => !SafeMode.get(),
};
