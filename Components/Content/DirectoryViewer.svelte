<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { sleep } from "$ts/util";
  import { UserDirectory } from "$types/fs";
  import Failed from "./DirectoryViewer/Failed.svelte";
  import FileItem from "./DirectoryViewer/FileItem.svelte";
  import FolderItem from "./DirectoryViewer/FolderItem.svelte";
  import Header from "./DirectoryViewer/Header.svelte";
  import Loading from "./DirectoryViewer/Loading.svelte";

  export let runtime: Runtime;

  let contents: UserDirectory;
  let loading = true;
  let failed = false;

  runtime.failed.subscribe((v) => (failed = v));
  runtime.loading.subscribe((v) => (loading = v));

  runtime.contents.subscribe(async (v) => {
    contents = undefined;
    sleep(0);
    contents = v;
  });

  function dragOver(e: DragEvent) {
    e.preventDefault(); // Stop browser from handling the file(s)
  }
</script>

<div
  class="directory-viewer"
  role="directory"
  on:dragover={dragOver}
  on:drop={(e) => runtime.dropFiles(e)}
>
  <Header />
  {#if contents}
    {#each contents.directories as dir}
      <FolderItem {dir} {runtime} />
    {/each}
    {#each contents.files as file}
      <FileItem {file} {runtime} />
    {/each}
    <!---->
    {#if !contents.files.length && !contents.directories.length}
      <p class="empty">This folder is empty.</p>
    {/if}
  {/if}

  {#if failed}
    <Failed />
  {/if}

  {#if loading}
    <Loading />
  {/if}
</div>
