<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { formatBytes } from "$ts/bytes";
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

  const { cutList, copyList, selected } = runtime;

  let date = "";
  let mime = "";
  let icon = "";

  onMount(() => {
    dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);
    dayjs.updateLocale("en", RelativeTimeMod);

    date = dayjs(file.dateModified).fromNow();

    const m = fromMime(file.mime);

    mime = m.replace(m[0], m[0].toUpperCase());
    icon = getMimeIcon(file.filename);
  });

  async function select(e: MouseEvent) {
    await sleep(0);

    runtime.updateSelection(e, file.scopedPath);
  }

  function open() {
    OpenFile(file, runtime.pid);
  }
</script>

<button
  class="item file"
  on:click={select}
  on:dblclick={open}
  class:cutting={$cutList.includes(file.scopedPath)}
  class:copying={$copyList.includes(file.scopedPath)}
  class:selected={$selected.includes(file.scopedPath)}
  class:virtual={file.virtual}
  class:system={file.system}
  class:hidden-file={file.hidden}
  data-contextmenu="dirviewer-file"
  data-path={file.scopedPath}
  data-name={file.filename}
>
  <div class="segment icon">
    <img src={file.icon || icon} alt="" />
  </div>
  <div class="segment name">{file.filename}</div>
  <div class="segment type">{file.system ? `System File` : mime}</div>
  <div class="segment size">{formatBytes(file.size)}</div>
  <div class="segment modified">{date}</div>
</button>
