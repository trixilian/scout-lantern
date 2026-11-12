import { describe, it, expect } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import fixture from '$lib/fixtures/cards.json';
import type { CardData } from '$lib/types';
import { load } from './+page';

const { cards } = fixture as CardData;

// `load` only uses the URL and the layout data, so a partial event is enough.
function callLoad(search: string) {
	return (
		load as unknown as (event: {
			url: URL;
			parent: () => Promise<{ cards: CardData['cards'] }>;
		}) => Promise<{ card: CardData['cards'][number] }>
	)({
		url: new URL(`http://localhost/card${search}`),
		parent: async () => ({ cards })
	});
}

async function loadError(search: string) {
	try {
		await callLoad(search);
	} catch (e) {
		if (isHttpError(e)) return e;
		throw e;
	}
	throw new Error('expected load to throw, but it resolved');
}

describe('card load', () => {
	it('returns the card with the id from ?id=', async () => {
		const result = await callLoad('?id=core-rg-125');

		expect(result.card.name).toBe('Lantern Halberd');
	});

	it('fails with 404 for an unknown id, naming the id', async () => {
		const error = await loadError('?id=core-xx-999');

		expect(error.status).toBe(404);
		expect(error.body.message).toContain('core-xx-999');
	});

	it('fails with 404 when there is no id', async () => {
		const error = await loadError('');

		expect(error.status).toBe(404);
	});
});
