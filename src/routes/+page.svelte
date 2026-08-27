<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Results</h1>
<div class="d-flex flex-row flex-wrap gap-3">
	{#each data.cards as card (card.id)}
		<div class="card gear-card">
			<p class="p-3 text-center">{card.name}</p>
		</div>
	{/each}
</div>

<style>
	.gear-card {
		flex: 0 0 auto;
		width: 10rem;
		aspect-ratio: 1;
	}
</style>
