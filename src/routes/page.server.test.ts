import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import type { Card, CardsResponse } from '$lib/types';

// `load` reads BACKEND_URL through this module, so it has to be mocked before import.
const mockEnv: { BACKEND_URL?: string } = {};
vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

const { load } = await import('./+page.server');

const card: Card = {
	id: 'core-gear-2',
	name: 'Founding Stone',
	keywords: ['weapon', 'melee', 'stone'],
	rules_text: 'Spend (a) to sling the stone from anywhere on the board!',
	weapon_stats: { speed: 2, accuracy: '*', strength: 1 }
};

/**
 * A fetch stub that returns `body` with `status`, ignoring the request.
 * The `url` parameter is unused but declared so `mock.calls` stays typed.
 */
function fetchReturning(body: unknown, status = 200) {
	return vi.fn(async (url: URL | RequestInfo) => {
		void url;
		return new Response(JSON.stringify(body), { status });
	});
}

/** Runs `load` and returns the HttpError it threw, failing if it resolved. */
async function loadError(fetch: ReturnType<typeof fetchReturning>) {
	try {
		await callLoad(fetch);
	} catch (e) {
		if (isHttpError(e)) return e;
		throw e;
	}
	throw new Error('expected load to throw, but it resolved');
}

// `load` only uses fetch and url, so a partial event is enough.
function callLoad(fetch: ReturnType<typeof fetchReturning>, url = new URL('http://localhost/')) {
	return (
		load as unknown as (event: { fetch: typeof fetch; url: URL }) => Promise<{
			cards: Card[];
			total: number;
			q: string;
		}>
	)({ fetch, url });
}

beforeEach(() => {
	mockEnv.BACKEND_URL = 'http://backend:3001';
});

describe('load', () => {
	it('returns the cards and total from the backend', async () => {
		const body: CardsResponse = { cards: [card], total: 1, version: 2 };
		const result = await callLoad(fetchReturning(body));

		expect(result).toEqual({ cards: [card], total: 1, q: '' });
	});

	it('requests /api/cards on the configured backend', async () => {
		const fetch = fetchReturning({ cards: [], total: 0, version: 2 });
		await callLoad(fetch);

		expect(String(fetch.mock.calls[0][0])).toBe('http://backend:3001/api/cards');
	});

	it('joins the path correctly when BACKEND_URL has a trailing slash', async () => {
		mockEnv.BACKEND_URL = 'http://backend:3001/';
		const fetch = fetchReturning({ cards: [], total: 0, version: 2 });
		await callLoad(fetch);

		expect(String(fetch.mock.calls[0][0])).toBe('http://backend:3001/api/cards');
	});

	it('treats an empty result as success, not an error', async () => {
		const body: CardsResponse = { cards: [], total: 0, version: 2 };
		const result = await callLoad(fetchReturning(body));

		expect(result).toEqual({ cards: [], total: 0, q: '' });
	});

	it('forwards the search term to the backend', async () => {
		const fetch = fetchReturning({ cards: [], total: 0, version: 2 });
		await callLoad(fetch, new URL('http://localhost/?q=bone'));

		expect(String(fetch.mock.calls[0][0])).toBe('http://backend:3001/api/cards?q=bone');
	});

	it('omits q entirely when the search is empty', async () => {
		const fetch = fetchReturning({ cards: [], total: 0, version: 2 });
		await callLoad(fetch, new URL('http://localhost/?q='));

		expect(String(fetch.mock.calls[0][0])).toBe('http://backend:3001/api/cards');
	});

	it('returns the search term so the input can show it', async () => {
		const body: CardsResponse = { cards: [card], total: 1, version: 2 };
		const result = await callLoad(fetchReturning(body), new URL('http://localhost/?q=bone'));

		expect(result.q).toBe('bone');
	});

	it('fails with 500 when BACKEND_URL is not set', async () => {
		delete mockEnv.BACKEND_URL;
		const error = await loadError(fetchReturning({}));

		expect(error.status).toBe(500);
		expect(error.body.message).toContain('BACKEND_URL');
	});

	it('propagates the backend status when the request fails', async () => {
		const error = await loadError(fetchReturning({ error: 'boom' }, 503));

		expect(error.status).toBe(503);
	});

	it('fails with 502 when the backend reports a different schema version', async () => {
		const error = await loadError(fetchReturning({ cards: [], total: 0, version: 1 }));

		expect(error.status).toBe(502);
		expect(error.body.message).toContain('version 1');
	});
});
