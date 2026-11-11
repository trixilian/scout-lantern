<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import GearCard from '$lib/components/GearCard.svelte';
	import { createSearch } from '$lib/search';
	import { parseQuery } from '$lib/query';

	let { data }: { data: PageData } = $props();

	const search = $derived(createSearch(data.cards));

	let rawQuery = $state(page.url.searchParams.get('q') ?? '');
	const parsed = $derived(parseQuery(rawQuery));
	const results = $derived(search(parsed));

	let timer: ReturnType<typeof setTimeout>;
	onDestroy(() => clearTimeout(timer));

	/** Mirror the search term into ?q= (debounced) so the URL stays shareable. */
	function syncUrl() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const url = new URL(page.url);
			if (rawQuery) url.searchParams.set('q', rawQuery);
			else url.searchParams.delete('q');

			// page.url already includes any base path; only its search params change here
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
					bind:value={rawQuery}
					placeholder="Search gear…"
					aria-describedby="q-warnings"
				/>
				<button class="btn btn-dark" type="submit">Search</button>
			</div>
			<ul id="q-warnings" class="list-unstyled form-text mb-0" aria-live="polite">
				{#each parsed.warnings as warning, i (i)}
					<li class="mt-1">
						<i class="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>{warning}
					</li>
				{/each}
			</ul>
		</form>
	</search>
</header>

<div class="gear-card-grid mx-2 mb-5">
	{#each results as card (card.id)}
		<GearCard {card} glossary={data.glossary} />
	{/each}
</div>

<footer class="small text-body-secondary text-center px-2 mb-4">
	Unofficial fan project. Card text and rule definitions © Kingdom Death; definitions from the
	<!-- An external link from the card data, so resolve() (which adds the base path) doesn't apply. -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={data.glossary.url}>Living Glossary</a>.
</footer>

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
