<script lang="ts">
	import type { Card } from '$lib/types';

	let { card }: { card: Card } = $props();
</script>

<div class="card gear-card">
	<h2 class="gear-card-name text-center mt-3 px-3">{card.name}</h2>
	<div class="gear-card-keywords px-3">
		{#each card.keywords as keyword (keyword)}
			<span>{keyword}</span>
		{/each}
	</div>
	<p class="gear-card-specialrules mt-auto mb-2 mx-2">
		{#each card.special_rules as specialrule (specialrule)}
			<span>{specialrule}</span>
		{/each}
	</p>
</div>

<style>
	.gear-card {
		--gear-card-tint: #e9eded;

		flex: 0 0 auto;
		width: 10rem;
		aspect-ratio: 1;
		background: radial-gradient(
			circle at center,
			color-mix(in srgb, var(--gear-card-tint) 2%, white),
			var(--gear-card-tint)
		);
	}
	.gear-card-name {
		font-family: var(--font-display);
		font-stretch: 62.5%;
		font-weight: 500;
		font-size: 1rem;
		margin: 0;
	}

	.gear-card-keywords {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 0.3em;
		font-style: italic;
		font-size: 0.6rem;
		margin: 0;
	}
	.gear-card-keywords span {
		white-space: nowrap;
	}
	.gear-card-keywords span:not(:last-child)::after {
		content: ',';
	}

	.gear-card-specialrules {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 0.3em;
		font-size: 0.7rem;
		font-weight: 500;
		margin: 0;
	}
	.gear-card-specialrules span:not(:last-child)::after {
		content: ',';
	}
</style>
