<script lang="ts">
  import Titlebar from "$state/Desktop/Components/ProcessRenderer/Window/Titlebar.svelte";
  import { Runtime } from "../ts/runtime";
  import AddressBar from "./Content/AddressBar.svelte";
  import DirectoryViewer from "./Content/DirectoryViewer.svelte";

  export let runtime: Runtime;
</script>

<div class="content">
  <Titlebar app={runtime.appMutator} pid={runtime.pid} />
  <AddressBar {runtime} />
  <DirectoryViewer {runtime} />
</div>
