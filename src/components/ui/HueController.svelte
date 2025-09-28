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
      }, 20);
    })(hue);
  });
</script>

<div role="menu" class="hoverdown flex items-center">
  <button class="btn icon" data-variant="ghost">
    <Icon icon="lucide:palette" class="icon" />
  </button>
  <div class="content">
    <div class="card flex items-center justify-center bg-surface p-2 w-80">
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
</div>
