<script lang="ts">
	import type { HitLocation } from '$lib/types';
	import HitLocationIcon from './icons/HitLocationIcon.svelte';

	let { value, hit_location }: { value: number; hit_location: HitLocation[] } = $props();
</script>

<div class="armor">
	<svg viewBox="0 0 24 28" class="armor-value" role="img" aria-label="Armor {value}">
		<path d="M2 1 H22 V13 C22 20 17 25 12 27 C7 25 2 20 2 13 Z" />
		<text
			class="armor-text"
			fill="white"
			x="12"
			y="14"
			text-anchor="middle"
			dominant-baseline="middle">{value}</text
		>
	</svg>
	<div class="hit-locations">
		{#each hit_location as location (location)}
			<HitLocationIcon {location} />
		{/each}
	</div>
</div>

<style>
	.armor {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0em; /* set this to 0 for no gap */
	}
	.hit-locations {
		display: flex;
		justify-content: center;
		gap: 0;
		font-size: 0.75em; /* two icons fit under the 1.75rem shield */
	}
	.armor-value {
		width: 100%; /* fill the 1.75rem wrapper in GearCard */
	}
	.armor-text {
		font-family: var(--font-number);
		font-weight: 100; /* lighter than the title's 500 */
		font-size: 12px;
	}
</style>
