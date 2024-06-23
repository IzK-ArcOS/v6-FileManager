<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { GetSystemFolderIcon } from "$apps/FileManager/ts/store";
  import { FolderIcon } from "$ts/images/filesystem";
  import { sleep } from "$ts/util";
  import { PartialUserDir } from "$types/fs";
  import { onMount } from "svelte";

  export let runtime: Runtime;
  export let dir: PartialUserDir;

  const { cutList, copyList, selected } = runtime;

  let icon = FolderIcon;

  onMount(() => (icon = GetSystemFolderIcon(dir.scopedPath)));

  function goHere() {
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
  class:virtual={dir.virtual}
  class:system={dir.system}
  class:hidden-file={dir.hidden}
  on:dblclick={goHere}
>
  <div class="segment icon">
    <img src={icon} alt="" />
  </div>
  <div class="segment name">{dir.name}</div>
  <div class="segment type">Folder</div>
  <div class="segment size">-</div>
  <div class="segment modified">-</div>
</button>
