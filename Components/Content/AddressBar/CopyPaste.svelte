<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";

  export let runtime: Runtime;

  const { copyList, cutList, selected, contents } = runtime;

  function cut() {
    runtime.setCutFiles();
  }

  function copy() {
    runtime.setCopyFiles();
  }

  function paste() {
    runtime.pasteFiles();
  }
</script>

<div class="portion copy-paste">
  <button
    class="material-icons-round"
    on:click={cut}
    disabled={!$selected.length || ($contents && $contents.virtual)}
    class:suggested={$cutList.length}
    title="Cut items"
  >
    content_cut
  </button>
  <button
    class="material-icons-round"
    on:click={copy}
    disabled={!$selected.length || ($contents && $contents.virtual)}
    class:suggested={$copyList.length}
    title="Copy items"
  >
    content_copy
  </button>
  <button
    class="material-icons-round"
    on:click={paste}
    disabled={(!$copyList.length && !$cutList.length) || ($contents && $contents.virtual)}
    title="Paste items"
  >
    content_paste
  </button>
</div>
