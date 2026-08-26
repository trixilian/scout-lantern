<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>KDM Cards</h1>
<div class="results">
	{#each data.cards as card (card.id)}
		<div class="card">
			{card.name}
		</div>
	{/each}
</div>

<style>
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 10px;
	}
	.card {
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 10px;
		margin: 10px 0;
	}
</style>
