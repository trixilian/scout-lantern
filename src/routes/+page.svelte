<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>KDM Cards</h1>
<div class="col-12">
	{#each data.cards as card (card.id)}
		<div class="card">
			{card.name}
		</div>
	{/each}
</div>
