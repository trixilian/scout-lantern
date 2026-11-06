<script lang="ts">
	import '../app.scss';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Scout Lantern</title>
</svelte:head>

<main>
	{@render children()}
</main>
