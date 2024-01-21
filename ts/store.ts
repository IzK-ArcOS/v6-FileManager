import { DocumentsFolderIcon, ThemeFolderIcon, WallpapersFolderIcon } from "$ts/images/filesystem";
import { SystemFolder } from "./types";

export const SystemFolders: SystemFolder[] = [
  {
    name: "Documents",
    path: "./Documents",
    icon: DocumentsFolderIcon,
  },
  {
    name: "Themes",
    path: "./Themes",
    icon: ThemeFolderIcon,
  },
  {
    name: "Wallpapers",
    path: "./Wallpapers",
    icon: WallpapersFolderIcon,
  }
]