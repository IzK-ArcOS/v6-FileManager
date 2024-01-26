<script lang="ts">
  import { Runtime } from "$apps/FileManager/ts/runtime";
  import { formatBytes } from "$ts/bytes";

  export let runtime: Runtime;

  const { quota } = runtime;
</script>

<div class="fs-quota">
  <div class="bar">
    <div class="inner" style="--w: {(100 / $quota.max) * $quota.used}%;" />
  </div>
  <div class="stats">
    <p class="used">{formatBytes($quota.used)}</p>
    <p class="max">{formatBytes($quota.max)}</p>
  </div>
</div>
