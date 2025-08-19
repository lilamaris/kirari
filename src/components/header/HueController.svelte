<script lang="ts">
  import { getHue, setHue } from "@/lib/utils";

  let hue = $state(getHue());

  $effect(() => {
    setHue(hue);
  });
</script>

<div class="flex flex-col absolute bg-background">
  <input type="range" bind:value={hue} min="0" max="360" step="5" />
</div>
