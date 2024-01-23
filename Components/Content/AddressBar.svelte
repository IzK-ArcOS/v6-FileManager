<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { pathToFriendlyPath } from "$ts/server/fs/util";
  import CopyPaste from "./AddressBar/CopyPaste.svelte";
  import UpDownload from "./AddressBar/UpDownload.svelte";

  export let runtime: Runtime;

  const { path } = runtime;
</script>

<div class="address-bar">
  <div class="portion address">
    <button
      class="material-icons-round parent"
      on:click={() => runtime.parentDir()}
    >
      arrow_upward
    </button>
    <div class="path">{pathToFriendlyPath($path)}</div>
  </div>
  <div class="sep" />
  <CopyPaste {runtime} />
  <div class="sep" />
  <div class="portion">
    <button class="material-icons-round">create_new_folder</button>
    <button class="material-icons-round">add</button>
  </div>
  <div class="sep" />
  <UpDownload {runtime} />
</div>
