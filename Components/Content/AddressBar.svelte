<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { pathToFriendlyPath } from "$ts/server/fs/util";
  import CopyPaste from "./AddressBar/CopyPaste.svelte";
  import UpDownload from "./AddressBar/UpDownload.svelte";

  export let runtime: Runtime;

  const { path, newFolder, contents } = runtime;
</script>

<div class="address-bar" class:system={$contents && $contents.system}>
  <div class="portion address">
    <button class="material-icons-round parent" on:click={() => runtime.parentDir()}>
      arrow_upward
    </button>
    <div class="path">
      {pathToFriendlyPath($path, !($path && $path.startsWith("ArcOS")))}{$contents &&
      $contents.virtual
        ? " (virtual)"
        : ""}
    </div>
  </div>
  <div class="sep" />
  <CopyPaste {runtime} />
  <div class="sep" />
  <div class="portion">
    <button
      class="material-icons-round"
      on:click={() => ($newFolder = true)}
      class:suggested={$newFolder}
      disabled={$contents && $contents.virtual}
    >
      create_new_folder
    </button>
  </div>
  <div class="sep" />
  <UpDownload {runtime} />
</div>
