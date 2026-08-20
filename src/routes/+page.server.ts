import type { PageServerLoad } from './$types';  
import cards from '$lib/data/cards.json';

export const load: PageServerLoad = async () => {
    return { cards };
};
