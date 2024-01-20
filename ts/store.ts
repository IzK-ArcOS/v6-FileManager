import { FileIcon } from "$ts/images/filesystem";
import { DesktopIcon, ThemesIcon } from "$ts/images/general";
import { SystemFolder } from "./types";

export const SystemFolders: SystemFolder[] = [
  {
    name: "Documents",
    path: "./Documents",
    icon: FileIcon,
  },
  {
    name: "Themes",
    path: "./Themes",
    icon: ThemesIcon,
  },
  {
    name: "Wallpapers",
    path: "./Wallpapers",
    icon: DesktopIcon,
  }
]