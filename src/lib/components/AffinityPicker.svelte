<script lang="ts">
	import { AFFINITY_KEYS, type AffinityKey } from '$lib/query';
	import type { AffinityColor } from '$lib/types';
	import { nextAffinityColor } from '$lib/affinity';

	/** The color of each edge and the center; null for blank. Use with `bind:value`. */
	let { value = $bindable() }: { value: Record<AffinityKey, AffinityColor | null> } = $props();
</script>

<!-- A blank gear card: one button per edge and one for the center square. -->
<div class="picker">
	{#each AFFINITY_KEYS as key (key)}
		<!-- data-color is left out for null (blank), so only the color rules below need it. -->
		<button
			type="button"
			class="spot spot-{key}"
			data-color={value[key]}
			aria-label="{key}: {value[key] ?? 'blank'}"
			title="Click to change the color"
			onclick={() => (value[key] = nextAffinityColor(value[key]))}
		></button>
	{/each}
</div>

<style>
	.picker {
		/* The spots are positioned inside this box. */
		position: relative;
		width: 8rem;
		aspect-ratio: 1;
		border: 1px solid var(--bs-border-color);
		border-radius: 0.5rem;
	}

	.spot {
		position: absolute;
		padding: 0;
		border: 1px solid var(--bs-border-color);
		background: var(--bs-body-bg);
		cursor: pointer;
	}
	.spot:hover {
		border-color: var(--bs-secondary-color);
	}

	/* Each edge is a half square on its side, like the affinities on the cards: as long as
	   the center square is wide (30%, so 35% from each end) and half as deep. */
	.spot-up,
	.spot-down {
		left: 35%;
		right: 35%;
		height: 15%;
	}
	.spot-up {
		top: 0;
	}
	.spot-down {
		bottom: 0;
	}

	.spot-left,
	.spot-right {
		top: 35%;
		bottom: 35%;
		width: 15%;
	}
	.spot-left {
		left: 0;
	}
	.spot-right {
		right: 0;
	}

	.spot-center {
		inset: 35%;
	}

	/* The same colors as the affinities on the gear cards. */
	.spot[data-color='red'] {
		background: #b3352c;
		border-color: #b3352c;
	}
	.spot[data-color='green'] {
		background: #3d7a3d;
		border-color: #3d7a3d;
	}
	.spot[data-color='blue'] {
		background: #2f5e9e;
		border-color: #2f5e9e;
	}
</style>
