<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";

  import { FileIcon } from "$ts/images/filesystem";
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

  let date = "";
  let selected = [];
  let mime = "";

  onMount(() => {
    dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);
    dayjs.updateLocale("en", RelativeTimeMod);

    date = dayjs(file.dateModified).fromNow();

    const m = fromMime(file.mime);

    mime = m.replace(m[0], m[0].toUpperCase());
  });

  runtime.selected.subscribe((v) => (selected = v));

  async function select(e: MouseEvent) {
    await sleep(0);

    runtime.updateSelection(e, file.scopedPath);
  }
</script>

<button
  class="item file"
  on:click={select}
  class:selected={selected.includes(file.scopedPath)}
>
  <div class="segment icon">
    <img src={FileIcon} alt="" />
  </div>
  <div class="segment name">{file.filename}</div>
  <div class="segment type">{mime}</div>
  <div class="segment modified">{date}</div>
</button>
