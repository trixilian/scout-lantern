<script lang="ts">
	import type { AffinityColor } from '$lib/types';
	import type { AffinityKey } from '$lib/query';

	/**
	 * One affinity square with the stroke around it, drawn as a single SVG. CSS borders snap
	 * each edge to whole pixels on its own, which makes a thin gap uneven at most zoom levels;
	 * an SVG scales as one shape, so the gap stays even.
	 * `spot`: an edge leaves out the stroke on the side that touches the card edge;
	 * "center" has the stroke all around.
	 */
	let { color, spot }: { color: AffinityColor; spot: AffinityKey } = $props();

	// Sizes in hundredths of a rem (175 is 1.75rem).
	const EDGE_LENGTH = 175; // along the card edge
	const EDGE_DEPTH = 90; // into the card
	const CENTER_SIZE = 150;
	const GAP = 4; // between the square and the stroke
	const STROKE = 12;
	const OUTSIDE = GAP + STROKE; // how far the stroke reaches past the square
	const RING = GAP + STROKE / 2; // an SVG stroke is centered on its line

	const along = $derived(spot === 'up' || spot === 'down');
	const width = $derived(spot === 'center' ? CENTER_SIZE : along ? EDGE_LENGTH : EDGE_DEPTH);
	const height = $derived(spot === 'center' ? CENTER_SIZE : along ? EDGE_DEPTH : EDGE_LENGTH);

	// The view box stops at the square on the open side, which cuts the stroke off there.
	const left = $derived(spot === 'left' ? 0 : -OUTSIDE);
	const top = $derived(spot === 'up' ? 0 : -OUTSIDE);
	const right = $derived(spot === 'right' ? width : width + OUTSIDE);
	const bottom = $derived(spot === 'down' ? height : height + OUTSIDE);
</script>

<svg
	class="affinity-shape"
	data-affinity={color}
	viewBox="{left} {top} {right - left} {bottom - top}"
	style:width="{(right - left) / 100}rem"
	style:height="{(bottom - top) / 100}rem"
	aria-hidden="true"
>
	<rect {width} {height} fill="currentColor" />
	<rect
		x={-RING}
		y={-RING}
		width={width + 2 * RING}
		height={height + 2 * RING}
		fill="none"
		stroke="currentColor"
		stroke-width={STROKE}
	/>
</svg>

<style>
	.affinity-shape {
		display: block;
	}
	/* The shapes paint with currentColor, so the color is set once here. */
	.affinity-shape[data-affinity='red'] {
		color: #b3352c;
	}
	.affinity-shape[data-affinity='green'] {
		color: #3d7a3d;
	}
	.affinity-shape[data-affinity='blue'] {
		color: #2f5e9e;
	}
</style>
