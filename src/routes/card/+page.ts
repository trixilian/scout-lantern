import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// The card id is a query parameter (/card?id=core-rg-125), not a path segment: the site
// is static files on GitHub Pages, so there can't be one file per card id.
export const load: PageLoad = async ({ url, parent }) => {
	const id = url.searchParams.get('id');
	const { cards } = await parent();
	const card = cards.find((card) => card.id === id);
	if (!card) error(404, id ? `No card with the id "${id}"` : 'No card id given');

	return { card };
};
