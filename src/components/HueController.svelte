<script lang="ts">
  import Icon from "@iconify/svelte";
  import { getHue, setHue } from "@/lib/utils";

  let hue = $state(getHue());

  let timer: NodeJS.Timeout;
  $effect(() => {
    ((hue: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setHue(hue);
      }, 50);
    })(hue);
  });
</script>

<div role="dialog" class="floating-menu flex" style="--gap: 1.25rem">
  <button
    class="btn"
    data-size="icon"
    data-variant="ghost"
    aria-haspopup="dialog"
  >
    <Icon icon="lucide:palette" class="icon" data-size="md" />
  </button>

  <div class="card w-80" data-float-menu-role="content">
    {hue}
    <input
      class="hueHandle"
      max="360"
      min="0"
      step="5"
      type="range"
      bind:value={hue}
    />
  </div>
</div>
