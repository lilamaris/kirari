<script lang="ts">
  import Icon from "@iconify/svelte";

  import { getTheme, setTheme } from "@/lib/utils";
  import type { SiteTheme } from "@/types";

  const themes: SiteTheme[] = ["light", "dark", "system"];
  let curIdx = $state(themes.indexOf(getTheme()));
  let nextIdx = $derived.by(() => {
    if (curIdx >= themes.length - 1) return 0;
    else return curIdx + 1;
  });

  const handleChangeTheme = () => {
    setTheme(themes[nextIdx]);
    curIdx = nextIdx;
  };

  const handleClickTheme = (idx: number) => {
    setTheme(themes[idx]);
    curIdx = idx;
  };
</script>

{#snippet ThemeIcon(theme: SiteTheme)}
  {#if theme === "light"}
    <Icon icon="lucide:sun" class="icon" />
  {:else if theme === "dark"}
    <Icon icon="lucide:moon" class="icon" />
  {:else}
    <Icon icon="lucide:contrast" class="icon" />
  {/if}
{/snippet}

<div role="menu" class="hoverdown flex items-center">
  <button
    class="btn icon"
    data-variant="ghost"
    onclick={() => handleChangeTheme()}
  >
    {@render ThemeIcon(themes[curIdx])}
  </button>

  <div class="content">
    <div class="card bg-surface p-1 flex gap-0.5 flex-col">
      {#each themes as theme, idx}
        <button
          class="btn w-full flex gap-5 px-1"
          class:bg-select={themes[curIdx] == theme}
          data-variant="ghost"
          onclick={() => handleClickTheme(idx)}
        >
          {@render ThemeIcon(theme)}

          <span class="flex-1 text-sm capitalize">
            {theme}
          </span>
        </button>
      {/each}
    </div>
  </div>
</div>
