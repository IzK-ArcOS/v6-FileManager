<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { FolderIcon } from "$ts/images/filesystem";
  import { sleep } from "$ts/util";
  import { PartialUserDir } from "$types/fs";

  export let runtime: Runtime;
  export let dir: PartialUserDir;
  export let selected: string[];

  const { cutList, copyList } = runtime;

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
  class:selected={selected.includes(dir.scopedPath)}
  on:dblclick={goHere}
>
  <div class="segment icon">
    <img src={FolderIcon} alt="" />
  </div>
  <div class="segment name">{dir.name}</div>
  <div class="segment type">Folder</div>
  <div class="segment size">-</div>
  <div class="segment modified">-</div>
</button>
