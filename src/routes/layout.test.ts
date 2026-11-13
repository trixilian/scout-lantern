import { describe, it, expect, vi } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import fixture from '$lib/fixtures/cards.json';
import { DATA_VERSION, type CardData } from '$lib/types';
import type { Search } from '$lib/search';
import { parseQuery } from '$lib/query';

vi.mock('$app/paths', () => ({ asset: (file: string) => `/base${file}` }));

// The layout loads the card data once, for every page.
const { load } = await import('./+layout');

function fetchReturning(body: unknown, status = 200) {
	return vi.fn(async (url: URL | RequestInfo) => {
		void url;
		return new Response(JSON.stringify(body), { status });
	});
}

// `load` only uses fetch, so a partial event is enough.
function callLoad(fetch: ReturnType<typeof fetchReturning>) {
	return (
		load as unknown as (event: { fetch: typeof fetch }) => Promise<{
			cards: unknown[];
			expansions: unknown;
			sources: unknown;
			glossary: unknown;
			search: Search;
		}>
	)({
		fetch
	});
}

async function loadError(fetch: ReturnType<typeof fetchReturning>) {
	try {
		await callLoad(fetch);
	} catch (e) {
		if (isHttpError(e)) return e;
		throw e;
	}
	throw new Error('expected load to throw, but it resolved');
}

describe('load', () => {
	it('fetches the card data under the base path, with the format version', async () => {
		const fetch = fetchReturning(fixture);
		await callLoad(fetch);

		expect(String(fetch.mock.calls[0][0])).toBe(`/base/data/cards.json?v=${DATA_VERSION}`);
	});

	it('returns the cards', async () => {
		const result = await callLoad(fetchReturning(fixture));

		expect(result.cards).toEqual(fixture.cards);
	});

	it('returns the expansions', async () => {
		const result = await callLoad(fetchReturning(fixture));

		expect(result.expansions).toEqual(fixture.expansions);
	});

	it('returns the sources', async () => {
		const result = await callLoad(fetchReturning(fixture));

		expect(result.sources).toEqual(fixture.sources);
	});

	it('returns the glossary', async () => {
		const result = await callLoad(fetchReturning(fixture));

		expect(result.glossary).toEqual(fixture.glossary);
	});

	it('returns a search over the cards', async () => {
		const result = await callLoad(fetchReturning(fixture));
		const cloth = (fixture as CardData).cards.filter((card) => card.name === 'Cloth');

		expect(result.search(parseQuery('cloth'))).toEqual(cloth);
	});

	it('fails with the response status when the download fails', async () => {
		const error = await loadError(fetchReturning({}, 404));

		expect(error.status).toBe(404);
	});

	it('fails when the data has a different format version', async () => {
		const error = await loadError(fetchReturning({ ...fixture, version: DATA_VERSION - 1 }));

		expect(error.body.message).toContain(`version ${DATA_VERSION - 1}`);
	});
});
