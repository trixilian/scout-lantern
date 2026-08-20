<script lang="ts">
        import type { PageData } from './$types';
        let { data }: { data: PageData } = $props();
  </script>

  <h1>KDM Cards</h1>
  <ul>
        {#each data.cards as card}
                <li>{card.name}</li>
        {/each}
  </ul>