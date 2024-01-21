<script lang="ts">
  import { Runtime } from "../ts/runtime";
  import { SystemFolders } from "../ts/store";
  import Folder from "./SideBar/Folder.svelte";
  import Quota from "./SideBar/Quota.svelte";

  export let runtime: Runtime;

  let current = "";

  runtime.path.subscribe((v) => (current = v));
</script>

<div class="sidebar">
  <div class="folders">
    {#each SystemFolders as folder}
      <Folder {folder} {runtime} {current} />
    {/each}
  </div>
  <Quota />
</div>
