<script lang="ts">
	import type { WeaponStats } from '$lib/types';
	import Activation from './icons/Activation.svelte';

	let { weapon_stats }: { weapon_stats: WeaponStats } = $props();
</script>

<div class="weapon fw-semibold text-white text-center">
	<div class="row-3"><Activation /></div>
	<hr class="m-0" />
	<div class="row-3">
		{weapon_stats.speed}
	</div>
	<div class="attacks">
		<div class="row-3">
			{#if weapon_stats.accuracy !== undefined}
				<span class="accuracy"
					>{weapon_stats.accuracy}<span class="plus" aria-hidden="true">+</span></span
				>
			{/if}
		</div>
		<hr class="m-0" />
		<div class="row-3">
			{weapon_stats.strength}
		</div>
	</div>
</div>

<style>
	.weapon {
		border-radius: 999px;
		background: #999999;
		width: 1.08rem;
		font-size: 0.66rem;
		line-height: 1.05rem;
		padding-bottom: 0.04rem;
	}
	.attacks {
		border-radius: 999px;
		background: #777777;
		margin: 0.1rem;
	}
	.weapon > hr {
		color: black;
		opacity: 1;
	}
	.attacks hr {
		color: #999999;
		opacity: 1;
	}
	/* Anchor for the "+", which sits just after the accuracy number. */
	.accuracy {
		position: relative;
	}
	/* Absolute, so it takes no space and the number stays centered. Nudge with left/bottom. */
	.plus {
		position: absolute;
		left: 100%;
		bottom: -0.6em;
		font-size: 0.8em;
		color: white;
		-webkit-text-stroke: 0.2em #777777;
		paint-order: stroke fill; /* draw the stroke under the fill, so it doesn't thin the + */
	}
</style>
