<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} - Scout Lantern</title>
</svelte:head>

<div class="p-2 col-12 col-sm-8 p-sm-4 mx-sm-auto">
	<h1>{page.status === 404 ? 'Not found' : 'Something went wrong'}</h1>
	<p>{page.error?.message}</p>
	<a href={resolve('/')}>Back to search</a>
</div>
