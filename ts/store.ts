import { ArcTermFolderIcon, DocumentsFolderIcon, FolderIcon, ThemeFolderIcon, WallpapersFolderIcon } from "$ts/images/filesystem";
import { HomeIcon } from "$ts/images/general";
import { SystemFolder } from "./types";

export const SystemFolders: SystemFolder[] = [
  {
    name: "Home",
    path: "./",
    icon: HomeIcon
  },
  {
    name: "Documents",
    path: "./Documents",
    icon: DocumentsFolderIcon,
  },
  {
    name: "Pictures",
    path: "./Pictures",
    icon: WallpapersFolderIcon
  },
  {
    name: "Scripts",
    path: "./Scripts",
    icon: ArcTermFolderIcon
  },
  {
    name: "Themes",
    path: "./Themes",
    icon: ThemeFolderIcon,
  },
  {
    name: "Wallpapers",
    path: "./Wallpapers",
    icon: FolderIcon,
  }
]