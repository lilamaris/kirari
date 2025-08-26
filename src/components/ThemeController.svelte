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
</script>

{#snippet ThemeIcon(theme: SiteTheme)}
  {#if theme === "light"}
    <Icon icon="lucide:sun" class="icon" data-size="md" />
  {:else if theme === "dark"}
    <Icon icon="lucide:moon" class="icon" data-size="md" />
  {:else}
    <Icon icon="lucide:contrast" class="icon" data-size="md" />
  {/if}
{/snippet}

<div role="menu" class="floating-menu flex" style="--gap: 1.25rem">
  <button
    class="btn"
    data-variant="ghost"
    aria-haspopup="dialog"
    onclick={() => handleChangeTheme()}
  >
    {@render ThemeIcon(themes[curIdx])}
  </button>

  <div data-float-menu-role="content" class="card flex gap-0.5 flex-col">
    {#each themes as theme}
      <button
        class="btn w-full flex gap-5 px-5 capitalize"
        onclick={() => setTheme(theme)}
        >{@render ThemeIcon(theme)}{theme}</button
      >
    {/each}
  </div>
</div>
