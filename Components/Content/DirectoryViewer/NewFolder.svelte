<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { createDirectory } from "$ts/server/fs/dir";

  export let runtime: Runtime;

  const { newFolder, path } = runtime;

  let name = "";

  newFolder.subscribe((v) => {
    if (!v) name = "";
  });

  async function create() {
    createDirectory(`${$path}/${name}`);

    cancel();
  }

  function cancel() {
    $newFolder = false;
  }
</script>

<div class="new-folder" class:show={$newFolder}>
  <p class="label">New folder:</p>
  <input type="text" bind:value={name} />
  <div class="actions">
    <button class="suggested" on:click={create}>Create</button>
    <button on:click={cancel}>Cancel</button>
  </div>
</div>
