<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { pathToFriendlyPath } from "$ts/server/fs/util";

  export let runtime: Runtime;

  let path: string = "";

  runtime.path.subscribe((v) => (path = pathToFriendlyPath(v)));
</script>

<div class="address-bar">
  <div class="portion address">
    <button
      class="material-icons-round parent"
      on:click={() => runtime.parentDir()}
    >
      arrow_upward
    </button>
    <div class="path">{path}</div>
  </div>
  <div class="sep" />
  <div class="portion">
    <button class="material-icons-round">content_cut</button>
    <button class="material-icons-round">content_copy</button>
    <button class="material-icons-round">content_paste</button>
  </div>
  <div class="sep" />
  <div class="portion">
    <button class="material-icons-round">create_new_folder</button>
    <button class="material-icons-round">add</button>
  </div>
  <div class="sep" />
  <div class="portion">
    <button class="material-icons-round">upload</button>
    <button class="material-icons-round">download</button>
  </div>
</div>
