import { ContextMenuItem } from "$types/app";
import { EditMenu } from "./altmenu/edit";
import { FileMenu } from "./altmenu/file";
import { GoMenu } from "./altmenu/go";
import { ViewMenu } from "./altmenu/view";
import { Runtime } from "./runtime";

export function FileManagerAltMenu(runtime: Runtime): ContextMenuItem[] {
  return [FileMenu(runtime), EditMenu(runtime), ViewMenu(), GoMenu(runtime)];
}
