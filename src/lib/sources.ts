import type { Card, Source } from '$lib/types';

/**
 * The source ids each expansion's cards use, by expansion id, e.g. `{ core: ['bs', 'bm'] }`.
 * Each list follows the display order of `sources`. A source used in several
 * expansions (Rare Gear) is in each of their lists; expansions without sources are left out.
 */
export const sourcesByExpansion = (
	cards: Card[],
	sources: Record<string, Source>
): Record<string, string[]> => {
	const used: Record<string, Set<string>> = {};
	for (const card of cards) {
		if (card.source === undefined) continue;
		(used[card.expansion] ??= new Set()).add(card.source);
	}

	// Filtering the keys of `sources` keeps their order, so nothing needs sorting.
	return Object.fromEntries(
		Object.entries(used).map(([expansion, ids]) => [
			expansion,
			Object.keys(sources).filter((id) => ids.has(id))
		])
	);
};
