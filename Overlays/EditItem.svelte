<script lang="ts">
  import HtmlSpinner from "$lib/Components/HtmlSpinner.svelte";
  import { renameItem } from "$ts/server/fs/copy";
  import { writeFile } from "$ts/server/fs/file";
  import { getMimeIcon } from "$ts/server/fs/mime";
  import { pathJoin } from "$ts/util";
  import { onMount } from "svelte";
  import { OverlayRuntime } from "../ts/overlays/runtime";
  import { FolderIcon } from "$ts/images/filesystem";
  import { TextEditorIcon } from "$ts/images/apps";
  import { HardwiredFsItemFlags } from "$ts/stores/filesystem";

  export let runtime: OverlayRuntime;

  let isNew = true;
  let path = "";
  let originalName = "";
  let newName = "";
  let working = false;

  onMount(() => {
    const args = runtime.process.args;

    if (!args.length) return runtime.closeApp();

    const currentPath = args[0];
    const currentFilename = args[1];

    const hardwired = HardwiredFsItemFlags[pathJoin(currentPath, currentFilename)];

    if (hardwired && hardwired.system) {
      cancel();
      return;
    }

    isNew = !currentFilename;

    originalName = isNew ? "" : currentFilename;
    newName = currentFilename || "";
    path = currentPath;
  });

  async function doIt() {
    working = true;

    if (isNew) {
      await writeFile(pathJoin(path, newName), new Blob([]));
    } else {
      await renameItem(pathJoin(path, originalName), pathJoin(path, newName));
    }

    runtime.closeApp();
  }

  function cancel() {
    runtime.closeApp();
  }
</script>

<div class="top">
  <div class="left">
    <img src={getMimeIcon(newName, TextEditorIcon)} alt="" />
  </div>
  <div class="right">
    <h3 class="header">{isNew ? "Create File" : "Rename file or folder"}</h3>
    <p>
      {#if isNew}
        Enter a filename for the new file:
      {:else}
        Enter a new name for the item:
      {/if}
    </p>
    <input type="text" placeholder={originalName} bind:value={newName} />
  </div>
</div>
<div class="bottom">
  <button on:click={cancel}>Cancel</button>
  <button class="suggested" disabled={!newName} on:click={doIt}>
    {#if working}
      <HtmlSpinner height={16} />
    {:else}
      {isNew ? "Create" : "Rename"}
    {/if}
  </button>
</div>
