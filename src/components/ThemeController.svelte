<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { SiteTheme } from "@/types/config";

  import { getTheme, setTheme } from "@/lib/utils";

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
    <Icon icon="lucide:sun" class="text-[1.25rem]" />
  {:else if theme === "dark"}
    <Icon icon="lucide:moon" class="text-[1.25rem]" />
  {:else}
    <Icon icon="lucide:contrast" class="text-[1.25rem]" />
  {/if}
{/snippet}

<div role="menu" class="floating-menu" style="--gap: 1.25rem">
  <button
    class="btn btn-icon"
    data-float-menu-role="trigger"
    aria-haspopup="menu"
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
