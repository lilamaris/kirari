<script lang="ts" module>
  import type { StyledProps } from "@/types";

  interface ContributionDay {
    color: string;
    contributionCount: number;
    date: string;
  }

  interface ContributionWeek {
    contributionDays: ContributionDay[];
  }

  interface Props extends StyledProps {}
</script>

<script lang="ts">
  import { onMount } from "svelte";

  let loading = $state(true);
  let error = $state(false);
  let calendar: { weeks: ContributionWeek[] } | null = $state(null);

  onMount(async () => {
    try {
      const res = await fetch("/api/github-calendar");
      calendar = await res.json();
    } catch (error) {
      error = true;
    } finally {
      loading = false;
    }
  });

  let clientWidth: number | null = $state(null);
  let { class: className, style: styleAttr }: Props = $props();
</script>

<div class={[className]} bind:clientWidth>
  {#if loading}
    <div
      class="w-full bg-select rounded-select animate-pulse"
      style={`min-height: ${clientWidth * 0.13207547169}px`}
    ></div>
  {:else if error}
    <p>Error</p>
  {:else if calendar}
    <div class="w-full grid grid-cols-53 rounded-select overflow-hidden">
      {#each calendar.weeks as week}
        <div class="grid grid-rows-7">
          {#each week.contributionDays as day}
            <div
              title={`${day.date}: ${day.contributionCount} contributions`}
              class="w-full h-full aspect-square"
              style={`background-color: ${day.color}`}
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>
