<script lang="ts">
  import Content from "./Components/Content.svelte";
  import SideBar from "./Components/SideBar.svelte";
  import Splash from "./Components/Splash.svelte";
  import "./css/main.css";
  import { Runtime } from "./ts/runtime";

  export let runtime: Runtime;

  const { starting } = runtime;
</script>

{#if !$starting}
  <SideBar {runtime} />
  <Content {runtime} />
{:else}
  <Splash />
{/if}
