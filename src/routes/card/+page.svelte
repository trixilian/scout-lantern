<script lang="ts">
	import type { PageData } from './$types';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AffinityBoxes from '$lib/components/AffinityBoxes.svelte';
	import GearCard from '$lib/components/GearCard.svelte';
	import RulesText from '$lib/components/RulesText.svelte';
	import { feedbackUrl } from '$lib/feedback';
	import { findTerm } from '$lib/glossary';
	import { formatSpecialRule } from '$lib/specialRules';

	let { data }: { data: PageData } = $props();
	const card = $derived(data.card);
	const expansion = $derived(data.expansions[card.expansion]);

	// The search this page was opened from, if any. Then "Back to search" goes back in the
	// history, so the results and the scroll position come back as they were.
	let fromSearch = $state<URLSearchParams | null>(null);
	afterNavigate(({ from }) => {
		if (from?.route.id === '/') fromSearch = from.url.searchParams;
	});
</script>

<svelte:head>
	<title>{card.name} - Scout Lantern</title>
</svelte:head>

<div class="p-2 col-12 col-xl-10 p-sm-4 mx-auto">
	<a
		class="d-inline-block mb-3 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
		href={fromSearch ? resolve(`/?${fromSearch}`) : resolve('/')}
		onclick={(e) => {
			if (!fromSearch) return;
			e.preventDefault();
			history.back();
		}}
	>
		<i class="bi bi-arrow-left" aria-hidden="true"></i> Back to search
	</a>

	<div class="row g-4">
		<div class="col-md-6">
			<div class="detail-card mx-auto">
				<GearCard {card} glossary={data.glossary} />
			</div>
		</div>

		<div class="col-md-6">
			<h1 class="card-title">{card.name}</h1>
			<dl class="row">
				<dt class="col-sm-4">Expansion</dt>
				<dd class="col-sm-8">{expansion?.name ?? card.expansion}</dd>
				{#if card.source}
					<dt class="col-sm-4">Source</dt>
					<dd class="col-sm-8">{card.source}</dd>
				{/if}
				{#if card.keywords}
					<dt class="col-sm-4">Keywords</dt>
					<dd class="col-sm-8">{card.keywords.join(', ')}</dd>
				{/if}
			</dl>

			{#if card.rules_text}
				<h2 class="h5 border-bottom pb-1">Rules text</h2>
				<p><RulesText text={card.rules_text} /></p>
			{/if}

			{#if card.affinity_boxes}
				<h2 class="h5 border-bottom pb-1">Affinity boxes</h2>
				<div class="detail-affinity-boxes mb-3">
					<AffinityBoxes affinity_boxes={card.affinity_boxes} />
				</div>
			{/if}

			{#if card.special_rules}
				<h2 class="h5 border-bottom pb-1">Special rules</h2>
				<dl>
					{#each card.special_rules as rule (rule.name)}
						{@const term = findTerm(data.glossary, rule.name)}
						<dt>{formatSpecialRule(rule)}</dt>
						<dd>{term?.text ?? 'No definition available.'}</dd>
					{/each}
				</dl>
				<p class="small text-body-secondary">
					Gear special rules from the
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={data.glossary.url}>{data.glossary.source}</a>
				</p>
			{/if}

			<p class="small mt-4">
				<i class="bi bi-flag me-1" aria-hidden="true"></i>
				<!-- An external link, so resolve() doesn't apply. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={feedbackUrl(card.id)} target="_blank" rel="noreferrer">
					Report a mistake on this card
				</a>
			</p>
		</div>
	</div>
</div>

<style>
	.detail-card {
		width: 13rem;
		zoom: 1.5;
	}
	@media (min-width: 992px) {
		.detail-card {
			zoom: 2;
		}
	}
	.detail-affinity-boxes {
		--gear-card-tint: #e9eded;
		font-size: 0.7rem;
		zoom: 1.5;
	}
	.detail-affinity-boxes :global(.affinity-box) {
		margin-inline: 0;
	}
	.card-title {
		font-family: var(--font-display);
	}
</style>
