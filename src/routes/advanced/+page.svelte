<script lang="ts">
	import type { PageData } from './$types';
	import { HIT_LOCATIONS } from '$lib/types';
	import { NUMBER_FILTERS, type NumberKey } from '$lib/filter';
	import { CLAUSE_OPS } from '$lib/query';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { buildQuery, type AdvancedSearchForm } from '$lib/buildQuery';
	import HitLocationIcon from '$lib/components/icons/HitLocationIcon.svelte';

	// In the order printed on weapon cards.
	const WEAPON_STATS: NumberKey[] = ['spd', 'acc', 'str'];

	let { data }: { data: PageData } = $props();
	const expansionIds = $derived(Object.keys(data.expansions));

	// Every expansion is checked at the start: the form begins with no expansion filter.
	// The starting value is read once on purpose; untrack() tells Svelte so (no warning).
	let form = $state<AdvancedSearchForm>({
		text: '',
		expansions: untrack(() => Object.keys(data.expansions)),
		hitLocations: [],
		stats: {
			spd: { op: '=', value: null },
			acc: { op: '=', value: null },
			str: { op: '=', value: null },
			arm: { op: '=', value: null }
		}
	});
</script>

<svelte:head>
	<title>Advanced search - Scout Lantern</title>
</svelte:head>

<!-- One row per stat: the name on the left, operator and number on the right. -->
{#snippet statRow(key: NumberKey)}
	{@const label = NUMBER_FILTERS[key].label}
	<div class="row mb-3">
		<label class="col-sm-3 col-form-label" for="stat-{key}">{label}</label>
		<div class="col-sm-9">
			<div class="input-group">
				<select
					class="form-select flex-grow-0 w-auto"
					aria-label="{label} comparison"
					bind:value={form.stats[key].op}
				>
					{#each CLAUSE_OPS as op (op)}
						<option value={op}>{op}</option>
					{/each}
				</select>
				<input
					class="form-control stat-value"
					type="number"
					inputmode="numeric"
					min="0"
					max="99"
					id="stat-{key}"
					bind:value={form.stats[key].value}
				/>
			</div>
		</div>
	</div>
{/snippet}

<div class="p-2 col-12 col-sm-8 p-sm-4 mx-sm-auto">
	<a
		class="d-inline-block mb-2 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
		href={resolve('/')}
	>
		<i class="bi bi-arrow-left" aria-hidden="true"></i> Back to search
	</a>
	<h1>Advanced search</h1>
	<form
		class="advanced-search-form"
		onsubmit={(e) => {
			e.preventDefault();
			const params = new URLSearchParams({ q: buildQuery(form, expansionIds) });
			goto(resolve(`/?${params}`));
		}}
	>
		<h2 class="h5 border-bottom pb-1 mt-4 mb-3">General</h2>
		<div class="row mb-3">
			<label class="col-sm-3 col-form-label" for="text">Text</label>
			<div class="col-sm-9">
				<input class="form-control" id="text" type="text" bind:value={form.text} />
			</div>
		</div>
		<fieldset class="row mb-3">
			<legend class="col-sm-3 col-form-label pt-0">Expansions</legend>
			<div class="col-sm-9">
				{#each expansionIds as expansion (expansion)}
					<div class="form-check form-check-inline">
						<input
							class="form-check-input"
							type="checkbox"
							id="e-{expansion}"
							value={expansion}
							bind:group={form.expansions}
						/>
						<label class="form-check-label" for="e-{expansion}">
							{data.expansions[expansion].name}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>

		<h2 class="h5 border-bottom pb-1 mt-4 mb-3">Weapon</h2>
		{#each WEAPON_STATS as key (key)}
			{@render statRow(key)}
		{/each}

		<h2 class="h5 border-bottom pb-1 mt-4 mb-3">Armor</h2>
		<fieldset class="row mb-3">
			<legend class="col-sm-3 col-form-label pt-0">Hit locations</legend>
			<div class="col-sm-9">
				{#each HIT_LOCATIONS as hitLocation (hitLocation)}
					<div class="form-check form-check-inline">
						<input
							class="form-check-input"
							type="checkbox"
							id="loc-{hitLocation}"
							value={hitLocation}
							bind:group={form.hitLocations}
						/>
						<label class="form-check-label text-capitalize" for="loc-{hitLocation}">
							<HitLocationIcon location={hitLocation} decorative />
							{hitLocation}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>
		{@render statRow('arm')}

		<div class="row mt-4">
			<div class="col-sm-9 offset-sm-3">
				<button type="submit" class="btn btn-dark">Search</button>
			</div>
		</div>
	</form>
</div>

<style>
	/* Stat values have at most two digits. The input group would otherwise stretch the
	   field to the full width; the extra rem leaves room for the spinner arrows. */
	.input-group > .stat-value {
		flex: 0 0 auto;
		width: 5rem;
	}
</style>
