<script lang="ts">
  import { Runtime } from "../ts/runtime";
  import { SystemFolders } from "../ts/store";
  import Folder from "./SideBar/Folder.svelte";
  import Quota from "./SideBar/Quota.svelte";

  export let runtime: Runtime;

  const { path } = runtime;
</script>

<div class="sidebar">
  <div class="folders">
    {#each SystemFolders as folder}
      <Folder {folder} {runtime} current={$path} />
    {/each}
  </div>
  <Quota {runtime} />
</div>
