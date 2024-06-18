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
  import Renamer from "./Item/Renamer.svelte";

  export let runtime: Runtime;
  export let file: PartialArcFile;

  const { cutList, copyList, renamer, selected } = runtime;

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
    if ($renamer == file.scopedPath) return;

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
  class:hidden-file={file.hidden}
  data-contextmenu="dirviewer-file"
  data-path={file.scopedPath}
  class:renaming={file.scopedPath == $renamer}
>
  <div class="segment icon">
    <img src={icon} alt="" />
  </div>
  <Renamer itempath={file.scopedPath} name={file.filename} {runtime} />
  <div class="segment type">{mime}</div>
  <div class="segment size">{formatBytes(file.size)}</div>
  <div class="segment modified">{date}</div>
</button>
