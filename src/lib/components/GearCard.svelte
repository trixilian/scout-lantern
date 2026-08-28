<script lang="ts">
	import type { Card } from '$lib/types';

	let { card }: { card: Card } = $props();
</script>

<div class="card gear-card p-3">
	<h2 class="gear-card-name text-center">{card.name}</h2>
</div>

<style>
	.gear-card {
		flex: 0 0 auto;
		width: 10rem;
		aspect-ratio: 1;
	}
	.gear-card-name {
		font-family: var(--font-display);
		font-stretch: 62.5%;
		font-weight: 300;
		font-size: 1rem;
		margin: 0;
	}
</style>
