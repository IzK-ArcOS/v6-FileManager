<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { FolderIcon } from "$ts/images/filesystem";
  import { PartialUserDir } from "$types/fs";

  export let runtime: Runtime;
  export let dir: PartialUserDir;

  function goHere() {
    runtime.navigate(dir.scopedPath);
  }
</script>

<button class="item folder" on:click={goHere}>
  <div class="segment icon">
    <img src={FolderIcon} alt="" />
  </div>
  <div class="segment name">{dir.name}</div>
  <div class="segment type">Folder</div>
  <div class="segment modified">-</div>
</button>
