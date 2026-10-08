<script lang="ts">
	import type { Card } from '$lib/types';
	import ArmorValue from './ArmorValue.svelte';
	import WeaponStats from './WeaponStats.svelte';
	import Activation from './icons/Activation.svelte';

	let { card }: { card: Card } = $props();
	const EDGES = ['top', 'right', 'bottom', 'left'] as const;

	const splitRules = $derived(card.rules_text?.split('(a)') ?? []);
</script>

<div class="card gear-card">
	{#if card.armor_value !== undefined}
		<div class="position-absolute top-0 start-0 m-2 armor-value">
			<ArmorValue value={card.armor_value} hit_location={card.hit_location ?? []}></ArmorValue>
		</div>
	{/if}
	{#each EDGES as edge (edge)}
		{#if card.affinities?.[edge]}
			<span class="affinity affinity-{edge}" data-affinity={card.affinities?.[edge]}></span>
		{/if}
	{/each}
	{#if card.weapon_stats}
		<div class="position-absolute top-0 start-0 m-2 armor-value">
			<WeaponStats weapon_stats={card.weapon_stats} />
		</div>
	{/if}
	<h2 class="gear-card-name text-center mt-3 px-3">{card.name}</h2>
	<div class="gear-card-keywords px-3 text-center">
		{#each card.keywords ?? [] as keyword (keyword)}
			<span>{keyword}</span>
		{/each}
	</div>
	<p class="gear-card-specialrules mt-auto mx-2 text-center">
		{#each card.special_rules ?? [] as specialrule (specialrule)}
			<span>{specialrule}</span>
		{/each}
	</p>
	<p class="gear-card-rulestext mx-2 mb-3 text-center">
		{#each splitRules as substring, i ('rulestext' + i)}
			{substring}
			{#if i + 1 < splitRules.length}
				<span class="activation"><Activation /></span>
			{/if}
		{/each}
	</p>
</div>

<style>
	.gear-card {
		--gear-card-tint: #e9eded;
		--affinity-thickness: 0.9rem;

		aspect-ratio: 1;
		background: radial-gradient(
			circle at center,
			color-mix(in srgb, var(--gear-card-tint) 2%, white),
			var(--gear-card-tint)
		);
		border-radius: 1rem;
	}
	.gear-card-name {
		font-family: var(--font-display);
		font-stretch: 62.5%;
		font-weight: 500;
		font-size: 1rem;
		margin: 0;
	}

	.gear-card-keywords {
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
		gap: 0 0.3em;
		font-size: 0.7rem;
		font-weight: 600;
		margin: 0;
	}
	.gear-card-specialrules span:not(:last-child)::after {
		content: ',';
	}

	.gear-card-rulestext {
		gap: 0 0.3em;
		font-size: 0.5rem;
		font-weight: 400;
		margin: 0;
	}

	.affinity {
		--affinity-gap: 0.02rem;
		--affinity-stroke: 0.12rem;

		position: absolute;
		background: var(--affinity-color);
	}

	.affinity::before {
		content: '';
		position: absolute;
		inset: calc(-1 * (var(--affinity-gap) + var(--affinity-stroke)));
		border: var(--affinity-stroke) solid var(--affinity-color);
	}

	.affinity[data-affinity='red'] {
		--affinity-color: #b3352c;
	}
	.affinity[data-affinity='green'] {
		--affinity-color: #3d7a3d;
	}
	.affinity[data-affinity='blue'] {
		--affinity-color: #2f5e9e;
	}

	.affinity-top::before {
		top: 0;
		border-top: none;
	}
	.affinity-bottom::before {
		bottom: 0;
		border-bottom: none;
	}
	.affinity-left::before {
		left: 0;
		border-left: none;
	}
	.affinity-right::before {
		right: 0;
		border-right: none;
	}

	.affinity-top,
	.affinity-bottom {
		width: 1.75rem;
		height: var(--affinity-thickness);
		left: 50%;
	}
	.affinity-top {
		top: calc(var(--affinity-thickness) / 2);
		transform: translate(-50%, -50%);
	}
	.affinity-bottom {
		bottom: calc(var(--affinity-thickness) / 2);
		transform: translate(-50%, 50%);
	}

	.affinity-left,
	.affinity-right {
		width: var(--affinity-thickness);
		height: 1.75rem;
		top: 50%;
	}
	.affinity-left {
		left: calc(var(--affinity-thickness) / 2);
		transform: translate(-50%, -50%);
	}
	.affinity-right {
		right: calc(var(--affinity-thickness) / 2);
		transform: translate(50%, -50%);
	}
	.armor-value {
		width: 1.75rem;
	}
	.activation {
		vertical-align: 0.1em;
	}
</style>
