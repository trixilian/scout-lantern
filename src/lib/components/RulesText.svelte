<script lang="ts">
	import Activation from './icons/Activation.svelte';

	/** Card text. `(a)` in the card data marks the activation symbol and is drawn as it. */
	let { text }: { text: string } = $props();

	const parts = $derived(text.split('(a)'));
</script>

{#each parts as part, i (i)}
	{part}
	{#if i + 1 < parts.length}
		<span class="activation"><Activation /></span>
	{/if}
{/each}

<style>
	.activation {
		vertical-align: 0.1em;
	}
</style>
