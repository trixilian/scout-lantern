<script lang="ts">
	import type { WeaponStats } from '$lib/types';

	let { weapon_stats }: { weapon_stats: WeaponStats } = $props();
</script>

<div class="weapon">
	{weapon_stats.speed}
	{weapon_stats.accuracy}
	{weapon_stats.strength}
</div>
