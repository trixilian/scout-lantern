<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import GearCard from '$lib/components/GearCard.svelte';

	onDestroy(() => clearTimeout(timer));

	let { data }: { data: PageData } = $props();

	let q = $state(data.q);
	let timer: ReturnType<typeof setTimeout>;

	function onInput() {
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

<search>
	<form data-sveltekit-keepfocus class="p-2 col-12 col-sm-8 p-sm-4 mx-sm-auto">
		<label class="visually-hidden" for="q">Search gear</label>
		<div class="input-group">
			<span class="input-group-text"><i class="bi bi-search" aria-hidden="true"></i></span>
			<input
				oninput={onInput}
				class="form-control"
				id="q"
				type="search"
				name="q"
				bind:value={q}
				placeholder="Search gear…"
			/>
			<button class="btn btn-dark" type="submit">Search</button>
		</div>
	</form>
</search>

<div class="d-flex flex-row flex-wrap justify-content-between gap-1 gap-md-3 mx-1 mx-md-3">
	{#each data.cards as card (card.id)}
		<GearCard {card} />
	{/each}
</div>
