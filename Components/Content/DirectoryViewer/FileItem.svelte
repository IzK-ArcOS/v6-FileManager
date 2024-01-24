<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { formatBytes } from "$ts/bytes";
  import { renameItem } from "$ts/server/fs/copy";
  import { OpenFile } from "$ts/server/fs/file/handler";
  import { getMimeIcon } from "$ts/server/fs/mime";
  import { RelativeTimeMod } from "$ts/stores/dayjs";
  import { sleep } from "$ts/util";
  import { PartialArcFile } from "$types/fs";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import updateLocale from "dayjs/plugin/updateLocale";
  import { fromMime } from "human-filetypes";
  import { onMount } from "svelte";

  export let runtime: Runtime;
  export let file: PartialArcFile;
  export let selected: string[];

  const { cutList, copyList, path, renamer } = runtime;

  let date = "";
  let mime = "";
  let icon = "";
  let filename = "";
  let input: HTMLInputElement;

  onMount(() => {
    dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);
    dayjs.updateLocale("en", RelativeTimeMod);

    date = dayjs(file.dateModified).fromNow();

    const m = fromMime(file.mime);

    mime = m.replace(m[0], m[0].toUpperCase());
    icon = getMimeIcon(file.filename);
    filename = file.filename;
  });

  async function select(e: MouseEvent) {
    await sleep(0);

    runtime.updateSelection(e, file.scopedPath);
  }

  function open() {
    if ($renamer == file.scopedPath) return;

    OpenFile(file, runtime.pid);
  }

  async function rename(e: SubmitEvent) {
    e.preventDefault();

    await renameItem(file.scopedPath, `${$path}/${filename}`);
    await runtime.refresh();

    $renamer = "";
  }

  renamer.subscribe(async (v) => {
    if (v == file.filename) {
      await sleep(10);

      if (!input) return;

      input.focus();
    }
  });
</script>

<button
  class="item file"
  on:click={select}
  on:dblclick={open}
  class:cutting={$cutList.includes(file.scopedPath)}
  class:copying={$copyList.includes(file.scopedPath)}
  class:selected={selected.includes(file.scopedPath)}
>
  <div class="segment icon">
    <img src={icon} alt="" />
  </div>
  <div class="segment name" title={file.filename}>
    {#if $renamer == file.scopedPath}
      <form on:submit={rename}>
        <input type="text" bind:value={filename} bind:this={input} />
      </form>
    {:else}
      {file.filename}
    {/if}
  </div>
  <div class="segment type">{mime}</div>
  <div class="segment size">{formatBytes(file.size)}</div>
  <div class="segment modified">{date}</div>
</button>
