<script lang="ts">
	import type { AffinityBox } from '$lib/types';
	const { affinity_boxes }: { affinity_boxes: AffinityBox[] } = $props();
</script>

{#each affinity_boxes as box (box)}
	<!-- One white frame per box: symbols and effect side by side in a row that never wraps. -->
	<div class="affinity-box rounded-2 bg-white text-start">
		<div class="symbols">
			{#each box.affinities as symbol, i (i)}
				<span class="symbol {symbol}"></span>
			{/each}
		</div>
		<span class="rounded-end affinity-effect">{box.effect}</span>
	</div>
{/each}

<style>
	.affinity-box {
		--effect-padding: 0.25rem;
		--symbol-size: 0.7rem;

		display: flex;
		gap: 0.25rem;
		/* Hug the content, and centre the box under the rules text. */
		width: fit-content;
		margin-inline: auto;
		padding: 0.1rem;
	}
	.affinity-box + .affinity-box {
		margin-top: 0.25rem;
	}

	.affinity-effect {
		padding: var(--effect-padding);
		background-color: var(--gear-card-tint);
	}

	/*
	 * Two columns, filled row by row: at most 3 rows for the up to 6 symbols a card has.
	 * Each row is one text line (1lh) tall and starts below the effect's top padding,
	 * so the symbol rows line up with the effect's lines.
	 */
	.symbols {
		display: grid;
		grid-template-columns: repeat(2, var(--symbol-size));
		grid-auto-rows: 1lh;
		column-gap: 0.1rem;
		flex-shrink: 0;
		/* Top-aligned; the effect still stretches to the full height of the box. */
		align-self: flex-start;
		margin-top: var(--effect-padding);
	}
	/* A single symbol gets one column, so no empty column is left beside it. */
	.symbols:has(> :only-child) {
		grid-template-columns: var(--symbol-size);
	}

	/* Every symbol gets the same slot, so squares and puzzle pieces line up. */
	.symbol {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Same colors as the affinity edges in GearCard. */
	.red-square,
	.red-puzzle {
		--symbol-color: #b3352c;
	}
	.green-square,
	.green-puzzle {
		--symbol-color: #3d7a3d;
	}
	.blue-square,
	.blue-puzzle {
		--symbol-color: #2f5e9e;
	}

	/* The square is a colored box, a little smaller than its slot. */
	.red-square::before,
	.green-square::before,
	.blue-square::before {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		background-color: var(--symbol-color);
	}

	/* The puzzle piece is Bootstrap Icons' "puzzle-fill" glyph, drawn from the icon font. */
	.red-puzzle::before,
	.green-puzzle::before,
	.blue-puzzle::before {
		content: '\f502';
		font-family: 'bootstrap-icons';
		font-size: var(--symbol-size);
		line-height: 1;
		color: var(--symbol-color);
	}
</style>
