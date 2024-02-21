<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { DownloadFile } from "$ts/server/fs/download";
  import { readFile } from "$ts/server/fs/file";
  import { directUploadProgressy } from "$ts/server/fs/upload/progress";

  export let runtime: Runtime;

  const { selected, path } = runtime;

  async function download() {
    const file = await readFile($selected[0]);

    DownloadFile(file);
  }

  async function upload() {
    directUploadProgressy($path, true, runtime.pid);
  }
</script>

<div class="portion">
  <button class="material-icons-round" on:click={upload}>upload</button>
  <button class="material-icons-round" disabled={$selected.length !== 1} on:click={download}>
    download
  </button>
</div>
