<script lang="ts">
	import type { Component } from 'svelte';
	import type { HitLocation } from '$lib/types';
	import Head from './Head.svelte';
	import Arms from './Arms.svelte';
	import Chest from './Chest.svelte';
	import Waist from './Waist.svelte';
	import Legs from './Legs.svelte';

	/** `decorative`: the icon sits next to text that already names the location. */
	let { location, decorative = false }: { location: HitLocation; decorative?: boolean } = $props();

	const ICONS: Record<HitLocation, Component> = {
		head: Head,
		arms: Arms,
		chest: Chest,
		waist: Waist,
		legs: Legs
	};
	const Icon = $derived(ICONS[location]);
</script>

{#if decorative}
	<span class="hit-location" aria-hidden="true"><Icon /></span>
{:else}
	<span class="hit-location" role="img" aria-label={location}><Icon /></span>
{/if}

<style>
	.hit-location {
		display: inline-block;
		line-height: 1;
		filter: brightness(0);
	}
</style>
