import {
  ArcTermFolderIcon,
  DocumentsFolderIcon,
  FolderIcon,
  ThemeFolderIcon,
  WallpapersFolderIcon,
} from "$ts/images/filesystem";
import { HomeIcon } from "$ts/images/general";
import { directUploadProgressy } from "$ts/server/fs/upload/progress";
import { pathToFriendlyPath } from "$ts/server/fs/util";
import { Runtime } from "../runtime";
import { SystemFolder } from "../types";

export const SystemFolders: SystemFolder[] = [
  {
    name: "Home",
    path: "./",
    icon: HomeIcon,
  },
  {
    name: "Documents",
    path: "./Documents",
    icon: DocumentsFolderIcon,
  },
  {
    name: "Pictures",
    path: "./Pictures",
    icon: WallpapersFolderIcon,
  },
  {
    name: "Scripts",
    path: "./Scripts",
    icon: ArcTermFolderIcon,
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
  },
];

export function FileManagerDispatches(runtime: Runtime): Record<string, (...data: any[]) => void> {
  return {
    refresh: () => runtime.refresh(),
    "new-folder": () => runtime.newFolder.set(true),
    "change-dir": (data) => {
      if (typeof data === "string") runtime.navigate(data);
    },
    "context-copy": (data) => runtime.setCopyFiles(data ? [data] : null),
    "context-cut": (data) => runtime.setCutFiles(data ? [data] : null),
    "context-paste": () => runtime.pasteFiles(),
    "context-delete": async (data) => {
      if (data) runtime.selected.set([data]);

      await runtime.deleteSelected();
    },
    "context-rename": (data) => runtime.renameItem(data),
    "upload-file": (path) => {
      if (runtime.isVirtual()) return;

      directUploadProgressy(path, true, runtime.pid);
    },
    "create-empty-file": () => {
      runtime.createEmptyFile();
    },
  };
}

export function GetSystemFolderIcon(path: string) {
  path = `./${pathToFriendlyPath(path)}`;

  const folders = SystemFolders.filter((a) => a.path == path);

  if (!folders.length) return FolderIcon;

  return folders[0].icon;
}
