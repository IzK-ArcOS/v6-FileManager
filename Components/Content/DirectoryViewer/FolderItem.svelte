<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { FolderIcon } from "$ts/images/filesystem";
  import { renameItem } from "$ts/server/fs/copy";
  import { sleep } from "$ts/util";
  import { PartialUserDir } from "$types/fs";
  import { onMount } from "svelte";

  export let runtime: Runtime;
  export let dir: PartialUserDir;
  export let selected: string[];

  const { cutList, copyList, path, renamer } = runtime;

  let filename = "";
  let input: HTMLInputElement;

  onMount(() => {
    filename = dir.name;
  });

  function goHere() {
    runtime.navigate(dir.scopedPath);
  }

  async function select(e: MouseEvent) {
    await sleep(0);

    runtime.updateSelection(e, dir.scopedPath);
  }

  async function rename(e: SubmitEvent) {
    e.preventDefault();

    if (filename !== dir.name) {
      await renameItem(dir.scopedPath, `${$path}/${filename}`);
      await runtime.refresh();
    }

    $renamer = "";
  }

  runtime.renamer.subscribe(async (v) => {
    if (v == dir.scopedPath) {
      await sleep(10);

      if (!input) return;

      input.focus();
    }
  });
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
  <div class="segment name">
    {#if $renamer == dir.name}
      <form on:submit={rename}>
        <input type="text" bind:value={filename} bind:this={input} />
      </form>
    {:else}
      {dir.name}
    {/if}
  </div>
  <div class="segment type">Folder</div>
  <div class="segment size">-</div>
  <div class="segment modified">-</div>
</button>
