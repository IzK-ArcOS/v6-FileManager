<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { GetSystemFolderIcon } from "$apps/FileManager/ts/store";
  import { FolderIcon } from "$ts/images/filesystem";
  import { sleep } from "$ts/util";
  import { PartialUserDir } from "$types/fs";
  import { onMount } from "svelte";
  import Renamer from "./Item/Renamer.svelte";

  export let runtime: Runtime;
  export let dir: PartialUserDir;

  const { cutList, copyList, renamer, selected } = runtime;

  let icon = FolderIcon;

  onMount(() => (icon = GetSystemFolderIcon(dir.scopedPath)));

  function goHere() {
    if ($renamer == dir.scopedPath) return;

    runtime.navigate(dir.scopedPath);
  }

  async function select(e: MouseEvent) {
    await sleep(0);

    runtime.updateSelection(e, dir.scopedPath);
  }
</script>

<button
  class="item folder"
  on:click={select}
  class:cutting={$cutList.includes(dir.scopedPath)}
  class:copying={$copyList.includes(dir.scopedPath)}
  class:selected={$selected.includes(dir.scopedPath)}
  class:renaming={dir.scopedPath == $renamer}
  class:virtual={dir.virtual}
  class:system={dir.system}
  class:hidden-file={dir.hidden}
  on:dblclick={goHere}
>
  <div class="segment icon">
    <img src={icon} alt="" />
  </div>
  <Renamer itempath={dir.scopedPath} name={dir.name} {runtime} />
  <div class="segment type">Folder</div>
  <div class="segment size">-</div>
  <div class="segment modified">-</div>
</button>
