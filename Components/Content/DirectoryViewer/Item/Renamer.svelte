<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { renameItem } from "$ts/server/fs/copy";
  import { sleep } from "$ts/util";
  import { onMount } from "svelte";

  export let itempath: string;
  export let name: string;
  export let runtime: Runtime;

  const { renamer, path } = runtime;

  let filename: string;
  let input: HTMLInputElement;

  async function rename(e: SubmitEvent) {
    e.preventDefault();

    await renameItem(itempath, `${$path}/${filename}`);
    await runtime.refresh();

    $renamer = "";
  }

  renamer.subscribe(async (v) => {
    if (v == name) {
      await sleep(10);

      if (!input) return;

      input.focus();
    }
  });

  onMount(() => {
    filename = name;
  });
</script>

<div class="segment name" title={name}>
  {#if $renamer == itempath}
    <form on:submit={rename}>
      <input type="text" bind:value={filename} bind:this={input} />
    </form>
  {:else}
    {name}
  {/if}
</div>
