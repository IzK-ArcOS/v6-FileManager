<script lang="ts">
  import Content from "./Components/Content.svelte";
  import SideBar from "./Components/SideBar.svelte";
  import "./css/main.css";
  import { Runtime } from "./ts/runtime";

  export let runtime: Runtime;
</script>

<SideBar />
<Content {runtime} />
