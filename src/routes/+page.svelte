<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import GearCard from '$lib/components/GearCard.svelte';
	import { createSearch } from '$lib/search';

	let { data }: { data: PageData } = $props();

	const search = $derived(createSearch(data.cards));

	let q = $state(page.url.searchParams.get('q') ?? '');
	const results = $derived(search(q));

	const expansions = $derived(new Set(data.cards.map((card) => card.expansion)));
	let selectedExpansions = $state<string[]>([]);
	const filteredResults = $derived(
		selectedExpansions.length === 0
			? results
			: results.filter((card) => selectedExpansions.includes(card.expansion))
	);

	let timer: ReturnType<typeof setTimeout>;
	onDestroy(() => clearTimeout(timer));

	/** Mirror the search term into ?q= (debounced) so the URL stays shareable. */
	function syncUrl() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const url = new URL(page.url);
			if (q) url.searchParams.set('q', q);
			else url.searchParams.delete('q');

			// page.url already includes any base path — we only change its search params
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(url, { keepFocus: true, replaceState: true, noScroll: true });
		}, 300);
	}
</script>

<header class="sticky-top">
	<search>
		<form
			class="p-2 col-12 col-sm-8 p-sm-4 mx-sm-auto"
			onsubmit={(e) => {
				e.preventDefault();
				syncUrl();
			}}
		>
			<label class="visually-hidden" for="q">Search gear</label>
			<div class="input-group">
				<span class="input-group-text"><i class="bi bi-search" aria-hidden="true"></i></span>
				<input
					oninput={syncUrl}
					class="form-control"
					id="q"
					type="search"
					name="q"
					bind:value={q}
					placeholder="Search gear…"
				/>
				<button class="btn btn-dark" type="submit">Search</button>
			</div>
			<fieldset class="mt-2">
				<legend class="visually-hidden">Expansion</legend>
				{#each expansions as expansion (expansion)}
					<div class="form-check form-check-inline">
						<input
							class="form-check-input"
							type="checkbox"
							id={`expansion-${expansion}`}
							bind:group={selectedExpansions}
							value={expansion}
						/>
						<label class="form-check-label" for={`expansion-${expansion}`}>
							{expansion}
						</label>
					</div>
				{/each}
			</fieldset>
		</form>
	</search>
</header>

<div class="gear-card-grid mx-2 mb-5">
	{#each filteredResults as card (card.id)}
		<GearCard {card} />
	{/each}
</div>

<style>
	.gear-card-grid {
		/* Card width scales with the viewport, bounded at 11rem and 13rem.
		   minmax() can't do this: a fixed max pins every track to that max. */
		display: grid;
		grid-template-columns: repeat(auto-fill, clamp(11rem, 25vw, 13rem));
		justify-content: center;
		gap: 0.5rem;
	}
</style>
