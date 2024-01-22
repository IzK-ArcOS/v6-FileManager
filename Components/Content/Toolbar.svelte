<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { pathToFriendlyName } from "$ts/server/fs/util";
  import { UserDataStore } from "$ts/stores/user";
  import { Plural as P } from "$ts/util";

  export let runtime: Runtime;

  const { contents, selected } = runtime;

  let folder = "";
  let size = 0;
  let grid = false;

  contents.subscribe((v) => {
    if (!v) return;

    folder = pathToFriendlyName(v.scopedPath);
    size = v.directories.length + v.files.length;
  });

  UserDataStore.subscribe((v) => {
    grid = !!(
      $UserDataStore.appdata.FileManager &&
      $UserDataStore.appdata.FileManager.grid
    );
  });

  function gridOff() {
    if (!$UserDataStore.appdata.FileManager)
      $UserDataStore.appdata.FileManager = {};

    $UserDataStore.appdata.FileManager.grid = false;
  }

  function gridOn() {
    if (!$UserDataStore.appdata.FileManager)
      $UserDataStore.appdata.FileManager = {};

    $UserDataStore.appdata.FileManager.grid = true;
  }
</script>

<div class="toolbar">
  <p class="count">
    {#if $selected.length}
      Selecting {$selected.length} of {size}
      {P("item", size)} in {folder}
    {:else}
      {size} {P("item", size)} in {folder}
    {/if}
  </p>
  <div class="view-modes">
    <button
      class="material-icons-round"
      class:suggested={!grid}
      on:click={gridOff}>list</button
    >
    <button
      class="material-icons-round"
      class:suggested={grid}
      on:click={gridOn}>grid_on</button
    >
  </div>
</div>
