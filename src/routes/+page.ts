import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { DATA_VERSION, type CardData } from '$lib/types';
import type { PageLoad } from './$types';

// Runs in the browser only (ssr = false). The load doesn't depend on the URL, so
// changing ?q= doesn't download the data again.
export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(asset('/data/cards.json'));
	if (!res.ok) error(res.status, `Could not load card data (${res.status})`);

	const data: CardData = await res.json();
	if (data.version !== DATA_VERSION) {
		error(500, `Card data version ${data.version}, expected ${DATA_VERSION}`);
	}

	return { cards: data.cards };
};
