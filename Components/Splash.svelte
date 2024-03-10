<script lang="ts">
  import Spinner from "$lib/Components/Spinner.svelte";
  import { FileManagerIcon } from "$ts/images/apps";
</script>

<div class="center-flex splash">
  <img src={FileManagerIcon} alt="" />
  <Spinner height={30} />
</div>
