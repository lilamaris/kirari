<script lang="ts">
  import { onMount } from "svelte";

  interface ContributionDay {
    color: string;
    contributionCount: number;
    date: string;
  }

  interface ContributionWeek {
    contributionDays: ContributionDay[];
  }

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
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p>Error</p>
{:else if calendar}
  <div class="card h-full w-full p-2 grid grid-cols-53">
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
