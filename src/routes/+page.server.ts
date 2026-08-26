import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { CardsResponse } from '$lib/types';
import type { PageServerLoad } from './$types';

/** Response schema version this frontend is written against. */
const API_VERSION = 1;

export const load: PageServerLoad = async ({ fetch }) => {
	const base = env.BACKEND_URL;
	if (!base) error(500, 'BACKEND_URL is not set');

	const res = await fetch(new URL('/api/cards', base));
	if (!res.ok) error(res.status, `Backend returned ${res.status}`);

	const body: CardsResponse = await res.json();
	if (body.version !== API_VERSION) {
		error(502, `Backend API version ${body.version}, expected ${API_VERSION}`);
	}

	return { cards: body.cards, total: body.total };
};
