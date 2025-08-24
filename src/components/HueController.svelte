<script lang="ts">
  import Icon from "@iconify/svelte";
  import { getHue, setHue } from "@/lib/utils";

  let hue = $state(getHue());

  $effect(() => {
    setHue(hue);
  });
</script>

<div role="menu" class="floating-menu" style="--gap: 1.25rem">
  <button
    class="btn btn-icon"
    data-float-menu-role="trigger"
    aria-haspopup="menu"
  >
    <Icon icon="lucide:palette" class="text-[1.25rem]" />
  </button>

  <div class="card w-80" data-float-menu-role="content">
    <input
      max="360"
      min="0"
      step="5"
      id="hueHandle"
      type="range"
      bind:value={hue}
    />
  </div>
</div>

<style>
  #hueHandle {
    border-radius: 0.125rem;
    padding: 0 5px 0 5px;
    appearance: none;
    height: 1.5rem;
    background-image: var(--rainbow);
    width: 100%;

    &::-moz-range-thumb {
      appearance: none;
      width: 0.5rem;
      height: 1rem;
      border: none;
      border-radius: 0.125rem;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: none;
    }

    &::-moz-range-thumb:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }

    &::-moz-range-thumb:active {
      background-color: rgba(255, 255, 255, 0.6);
    }

    &::-webkit-slider-thumb {
      appearance: none;
      width: 0.5rem;
      height: 1rem;
      border: none;
      border-radius: 0.125rem;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: none;
    }

    &::-webkit-slider-thumb:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }

    &::-webkit-slider-thumb:active {
      background-color: rgba(255, 255, 255, 0.6);
    }
  }
</style>
