<script lang="ts">
  import { formatBytes } from "$ts/bytes";
  import { GlobalDispatch } from "$ts/process/dispatch/global";
  import { getFSQuota } from "$ts/server/fs/quota";
  import { defaultQuota } from "$ts/stores/quota";
  import { FSQuota } from "$types/fs";
  import { onMount } from "svelte";

  let quota: FSQuota = defaultQuota;

  async function update() {
    quota = await getFSQuota();
  }

  onMount(update);
  GlobalDispatch.subscribe("fs-flush", update);
</script>

<div class="fs-quota">
  <div class="bar">
    <div class="inner" style="--w: {(100 / quota.max) * quota.used}%;" />
  </div>
  <div class="stats">
    <p class="used">{formatBytes(quota.used)}</p>
    <p class="max">{formatBytes(quota.max)}</p>
  </div>
</div>
