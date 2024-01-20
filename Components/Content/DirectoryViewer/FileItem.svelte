<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";

  import { FileIcon } from "$ts/images/filesystem";
  import { PartialArcFile } from "$types/fs";
  import dayjs from "dayjs";
  import { onMount } from "svelte";
  import relativeTime from "dayjs/plugin/relativeTime";
  import updateLocale from "dayjs/plugin/updateLocale";
  import { RelativeTimeMod } from "$ts/stores/dayjs";

  export let runtime: Runtime;
  export let file: PartialArcFile;

  let date = "";

  onMount(() => {
    dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);
    dayjs.updateLocale("en", RelativeTimeMod);

    date = dayjs(file.dateModified).fromNow();
  });

  function openIt() {
    runtime.openFile(file);
  }
</script>

<button class="item file" on:click={openIt}>
  <div class="segment icon">
    <img src={FileIcon} alt="" />
  </div>
  <div class="segment name">{file.filename}</div>
  <div class="segment type">{file.mime}</div>
  <div class="segment modified">{date}</div>
</button>
