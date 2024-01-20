<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { sleep } from "$ts/util";
  import { UserDirectory } from "$types/fs";
  import FileItem from "./DirectoryViewer/FileItem.svelte";
  import FolderItem from "./DirectoryViewer/FolderItem.svelte";
  import Header from "./DirectoryViewer/Header.svelte";

  export let runtime: Runtime;

  let contents: UserDirectory;

  runtime.contents.subscribe(async (v) => {
    contents = null;
    sleep(0);
    contents = v;
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="directory-viewer">
  <Header />
  {#if contents}
    {#each contents.directories as dir}
      <FolderItem {dir} {runtime} />
    {/each}
    {#each contents.files as file}
      <FileItem {file} {runtime} />
    {/each}
  {:else}
    nothing
  {/if}
</div>
