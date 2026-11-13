import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { DATA_VERSION, type CardData } from '$lib/types';
import { createSearch } from '$lib/search';
import type { LayoutLoad } from './$types';

// Static site: the HTML shell is prerendered at build time, and everything else
// (loading card data, searching) runs in the browser.
export const prerender = true;
export const ssr = false;

// Loads the card data once for every page (the search and the advanced search) and builds
// the search index from it. Runs in the browser only (ssr = false), which is also why the
// result may hold a function. The load doesn't use the URL, so neither a new ?q= nor
// switching to another page downloads the data or rebuilds the index.
export const load: LayoutLoad = async ({ fetch }) => {
	// GitHub Pages lets browsers cache files for 10 minutes. The version in the URL makes a
	// new site version fetch the matching data, not a cached file of the old format.
	const res = await fetch(asset(`/data/cards.json?v=${DATA_VERSION}`));
	if (!res.ok) error(res.status, `Could not load card data (${res.status})`);

	const data: CardData = await res.json();
	if (data.version !== DATA_VERSION) {
		error(500, `Card data version ${data.version}, expected ${DATA_VERSION}`);
	}

	return {
		cards: data.cards,
		expansions: data.expansions,
		sources: data.sources,
		glossary: data.glossary,
		search: createSearch(data.cards, data.sources)
	};
};
