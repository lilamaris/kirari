<script lang="ts">
  import type { SiteTheme } from "@/types/config";
  import { Moon, Palette, Sun, SunMoon } from "@lucide/svelte";
  import { setTheme } from "@/lib/utils";

  const themes: SiteTheme[] = ["light", "dark", "system"];
  let curIdx = $state(0);
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
    <!-- content here -->
    <Sun />
  {:else if theme === "dark"}
    <Moon />
  {:else}
    <SunMoon />
  {/if}
{/snippet}

<div role="menu" class="floating-menu" style="--gap: 1rem">
  <button
    class="btn"
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
