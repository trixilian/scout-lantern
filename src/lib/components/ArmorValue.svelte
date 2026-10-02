<script lang="ts">
	let { value }: { value: number } = $props();
</script>

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

<style>
	.armor-text {
		font-family: var(--font-number);
		font-stretch: 25%; /* Roboto Flex allows 25–151%; the title is 62.5% */
		font-weight: 100; /* lighter than the title's 500 */
		font-size: 12px;
	}
</style>
