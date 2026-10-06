<script lang="ts">
	import type { Component } from 'svelte';
	import type { HitLocation } from '$lib/types';
	import Head from './Head.svelte';
	import Arms from './Arms.svelte';
	import Chest from './Chest.svelte';
	import Waist from './Waist.svelte';
	import Legs from './Legs.svelte';

	let { location }: { location: HitLocation } = $props();

	const ICONS: Record<HitLocation, Component> = {
		head: Head,
		arms: Arms,
		chest: Chest,
		waist: Waist,
		legs: Legs
	};
	const Icon = $derived(ICONS[location]);
</script>

<span class="hit-location" role="img" aria-label={location}><Icon /></span>

<style>
	.hit-location {
		display: inline-block;
		line-height: 1;
		filter: brightness(0);
	}
</style>
