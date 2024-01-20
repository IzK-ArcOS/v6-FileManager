<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { pathToFriendlyName } from "$ts/server/fs/util";
  import { Plural as P } from "$ts/util";

  export let runtime: Runtime;

  let folder = "";
  let selected = [];
  let size = 0;

  runtime.contents.subscribe((v) => {
    if (!v) return;

    folder = pathToFriendlyName(v.scopedPath);
    size = v.directories.length + v.files.length;
  });

  runtime.selected.subscribe((v) => (selected = v));
</script>

<div class="toolbar">
  <p class="count">
    {#if selected.length}
      Selecting {selected.length} of {size}
      {P("item", size)} in {folder}
    {:else}
      {size} {P("item", size)} in {folder}
    {/if}
  </p>
  <div class="view-modes">
    <button class="material-icons-round">list</button>
    <button class="material-icons-round">grid_on</button>
  </div>
</div>
