<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<search>
	<form data-sveltekit-keepfocus class="p-2 col-12 col-sm-8 p-sm-4 mx-sm-auto">
		<label class="visually-hidden" for="q">Search gear</label>
		<div class="input-group">
			<span class="input-group-text"><i class="bi bi-search" aria-hidden="true"></i></span>
			<input
				class="form-control"
				id="q"
				type="search"
				name="q"
				value={data.q}
				placeholder="Search gear…"
			/>
			<button class="btn btn-dark" type="submit">Search</button>
		</div>
	</form>
</search>

<div class="d-flex flex-row flex-wrap gap-3">
	{#each data.cards as card (card.id)}
		<div class="card gear-card p-3">
			<h2 class="gear-card-name text-center">{card.name}</h2>
		</div>
	{/each}
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
