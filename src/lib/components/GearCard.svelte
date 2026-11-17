<script lang="ts">
	import type { Card, Glossary } from '$lib/types';
	import AffinityBoxes from './AffinityBoxes.svelte';
	import AffinityShape from './AffinityShape.svelte';
	import ArmorValue from './ArmorValue.svelte';
	import WeaponStats from './WeaponStats.svelte';
	import RulesText from './RulesText.svelte';
	import { formatSpecialRule } from '$lib/specialRules';
	import { findTerm } from '$lib/glossary';
	import { tooltip } from '$lib/tooltip';

	/** `href`: when set, the whole card is a link to it (the term buttons stay clickable). */
	let { card, glossary, href }: { card: Card; glossary: Glossary; href?: string } = $props();
	const EDGES = ['up', 'right', 'down', 'left'] as const;
</script>

<div
	class="card gear-card"
	class:has-stat-icon={card.armor_value !== undefined || card.weapon_stats !== undefined}
>
	{#if card.armor_value !== undefined}
		<div class="position-absolute top-0 start-0 m-2 armor-value">
			<ArmorValue value={card.armor_value} hit_location={card.hit_location ?? []}></ArmorValue>
		</div>
	{/if}
	{#each EDGES as edge (edge)}
		{#if card.affinities?.[edge]}
			<span class="affinity-edge affinity-{edge}">
				<AffinityShape color={card.affinities[edge]} spot={edge} />
			</span>
		{/if}
	{/each}
	{#if card.weapon_stats}
		<div class="position-absolute top-0 start-0 m-2 armor-value">
			<WeaponStats weapon_stats={card.weapon_stats} />
		</div>
	{/if}
	<h2 class="gear-card-name text-center mt-3">
		{#if href}
			<!-- stretched-link covers the whole card with the link's click area. -->
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a class="stretched-link text-reset text-decoration-none" {href}>{card.name}</a>
		{:else}
			{card.name}
		{/if}
	</h2>
	<div class="gear-card-keywords d-flex flex-wrap justify-content-center">
		{#each card.keywords ?? [] as keyword (keyword)}
			<span>{keyword}</span>
		{/each}
	</div>
	<p class="gear-card-specialrules d-flex flex-wrap justify-content-center mt-auto mx-2">
		{#each card.special_rules ?? [] as rule (rule.name)}
			{@const term = findTerm(glossary, rule.name)}
			<span>
				{#if term}
					<button type="button" class="term" {@attach tooltip(term.text)}>
						{formatSpecialRule(rule)}
					</button>
				{:else}
					{formatSpecialRule(rule)}
				{/if}
			</span>
		{/each}
	</p>
	<div class="gear-card-rulestext mx-2 text-center">
		{#each card.center_affinity ?? [] as color, i (i)}
			<span class="affinity-center mb-1"><AffinityShape {color} spot="center" /></span>
		{/each}
		<p class="mb-0">
			{#if card.rules_text}
				<RulesText text={card.rules_text} />
			{/if}
		</p>
		{#if card.affinity_boxes}
			<AffinityBoxes affinity_boxes={card.affinity_boxes}></AffinityBoxes>
		{/if}
	</div>
</div>

<style>
	.gear-card {
		--gear-card-tint: #e9eded;
		/* Size factor for the card text and the weapon stats (WeaponStats reads it too).
		   Keywords, affinities and the armor shield keep their size. */
		--gear-card-scale: 1.2;

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
		font-size: calc(1rem * var(--gear-card-scale));
		margin: 0;
	}

	/* Padding in CSS, not px-3: Bootstrap's utilities are !important and would win.
	   The armor icon and weapon pill are absolute, so the text doesn't flow around them;
	   padding on both sides keeps the text clear of them and still centered on the card. */
	.gear-card-name,
	.gear-card-keywords {
		padding-inline: 1rem;
	}
	/* The icon wrapper ends 2.25rem from the left edge (m-2 plus 1.75rem), plus a small gap. */
	.has-stat-icon .gear-card-name,
	.has-stat-icon .gear-card-keywords {
		padding-inline: 2.5rem;
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
		font-size: calc(0.7rem * var(--gear-card-scale));
		font-weight: 600;
		margin: 0;
	}
	.gear-card-specialrules span:not(:last-child)::after {
		content: ',';
	}

	/* A button, so the definition opens on hover, Tab and tap, but it looks like the text around it.
	   Positioned above the stretched card link (z-index 1), so a click opens the definition. */
	.term {
		position: relative;
		z-index: 2;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		cursor: help;
		text-decoration: underline dotted;
		text-underline-offset: 0.15em;
	}

	.gear-card-rulestext {
		gap: 0 0.3em;
		font-size: calc(0.5rem * var(--gear-card-scale));
		font-weight: 400;
		margin: 0;
		margin-bottom: 1.1rem;
	}

	/* Wrappers that place the edge shapes: each spans its whole card edge and centers the shape
	   with flexbox, so no translate() lands it on a fraction of a pixel. */
	.affinity-edge {
		position: absolute;
		display: flex;
	}
	.affinity-up,
	.affinity-down {
		inset-inline: 0;
		justify-content: center;
	}
	.affinity-up {
		top: 0;
	}
	.affinity-down {
		bottom: 0;
	}
	.affinity-left,
	.affinity-right {
		inset-block: 0;
		align-items: center;
	}
	.affinity-left {
		left: 0;
	}
	.affinity-right {
		right: 0;
	}
	.armor-value {
		width: 1.75rem;
	}
	/* Several center squares (Death Mehndi has three) sit side by side; their strokes are
	   part of the shape, so they need little extra space. */
	.affinity-center {
		display: inline-block;
		margin-inline: 0.05rem;
	}
</style>
