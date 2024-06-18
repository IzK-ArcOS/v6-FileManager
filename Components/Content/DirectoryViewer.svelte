<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { UserDataStore } from "$ts/stores/user";
  import Dropper from "./DirectoryViewer/Dropper.svelte";
  import Failed from "./DirectoryViewer/Failed.svelte";
  import FileItem from "./DirectoryViewer/FileItem.svelte";
  import FolderItem from "./DirectoryViewer/FolderItem.svelte";
  import Header from "./DirectoryViewer/Header.svelte";
  import Loading from "./DirectoryViewer/Loading.svelte";
  import NewFolder from "./DirectoryViewer/NewFolder.svelte";

  export let runtime: Runtime;

  const { loading, failed, contents, newFolder, path } = runtime;
  let dropping = false;

  function dragOver(e: DragEvent) {
    dropping = true;

    e.preventDefault(); // Stop browser from handling the file(s)
  }

  function drop(e: DragEvent) {
    runtime.dropFiles(e);

    dropping = false;
  }
</script>

<NewFolder {runtime} />
<div
  class="directory-viewer"
  role="directory"
  on:dragover={dragOver}
  on:drop={drop}
  on:dragenter={() => (dropping = true)}
  on:dragleave={() => (dropping = false)}
  class:grid={$UserDataStore.appdata.FileManager.grid}
  class:newfolder={$newFolder}
  class:dropping
  data-contextmenu="dirviewer"
  data-path={$path}
>
  <Header />
  {#if $contents}
    {#each $contents.directories as dir}
      {#if dir.hidden ? $UserDataStore.sh.showHiddenFiles : true}
        <FolderItem {dir} {runtime} />
      {/if}
    {/each}
    {#each $contents.files as file}
      {#if file.hidden ? $UserDataStore.sh.showHiddenFiles : true}
        <FileItem {file} {runtime} />
      {/if}
    {/each}
    <!---->
    {#if !$contents.files.length && !$contents.directories.length}
      <p class="empty">This folder is empty.</p>
    {/if}
  {/if}

  {#if $failed}
    <Failed />
  {/if}

  {#if $loading}
    <Loading />
  {/if}
</div>

{#if dropping}
  <Dropper />
{/if}
