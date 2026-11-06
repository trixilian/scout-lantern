import { describe, it, expect, vi } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import fixture from '$lib/fixtures/cards.json';
import { DATA_VERSION } from '$lib/types';

vi.mock('$app/paths', () => ({ asset: (file: string) => `/base${file}` }));

const { load } = await import('./+page');

function fetchReturning(body: unknown, status = 200) {
	return vi.fn(async (url: URL | RequestInfo) => {
		void url;
		return new Response(JSON.stringify(body), { status });
	});
}

// `load` only uses fetch, so a partial event is enough.
function callLoad(fetch: ReturnType<typeof fetchReturning>) {
	return (load as unknown as (event: { fetch: typeof fetch }) => Promise<{ cards: unknown[] }>)({
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
	it('fetches the card data under the base path', async () => {
		const fetch = fetchReturning(fixture);
		await callLoad(fetch);

		expect(String(fetch.mock.calls[0][0])).toBe('/base/data/cards.json');
	});

	it('returns the cards', async () => {
		const result = await callLoad(fetchReturning(fixture));

		expect(result.cards).toEqual(fixture.cards);
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
