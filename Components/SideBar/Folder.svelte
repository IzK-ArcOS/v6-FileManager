<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { SystemFolder } from "$apps/FileManager/ts/types";

  export let runtime: Runtime;
  export let folder: SystemFolder;
  export let current: string;

  function goHere() {
    runtime.navigate(folder.path);
  }
</script>

<button class="folder" on:click={goHere} class:selected={folder.path === current}>
  <img src={folder.icon} alt="" class="icon" />
  <span>{folder.name}</span>
</button>
