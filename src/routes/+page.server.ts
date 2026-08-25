import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { CardsResponse } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const base = env.BACKEND_URL;
	if (!base) error(500, 'BACKEND_URL is not set');

	const res = await fetch(new URL('/api/cards', base));
	if (!res.ok) error(res.status, `Backend returned ${res.status}`);

	const body: CardsResponse = await res.json();
	return { cards: body.cards, total: body.total };
};
