import MiniSearch from 'minisearch';
import type { Card } from '$lib/types';

/** Structured filters applied on top of the text search. Empty for now. */
export type SearchFilters = Record<string, never>;

export type Search = (query: string, filters?: SearchFilters) => Card[];

/**
 * Builds a full-text index over `cards` and returns a search function.
 *
 * Every word in the query must match (AND). Each word may be a prefix ("bon" finds
 * "Bone Blade"), and words of 6+ letters allow a small typo. An empty query returns every card in
 * data order. Callers only see `search(query, filters)`, so the engine can be swapped.
 */
export function createSearch(cards: Card[]): Search {
	const index = new MiniSearch<Card>({
		fields: ['name', 'keywords', 'rules_text', 'source'],
		// Keywords are a string[]; index them as one text field.
		extractField: (card, field) => {
			const value = card[field as keyof Card];
			return Array.isArray(value) ? value.join(' ') : ((value as string | undefined) ?? '');
		},
		searchOptions: {
			boost: { name: 3, keywords: 2 },
			prefix: true,
			// MiniSearch rounds 0.2 × length, so short words would already allow a typo
			// ("bone" would match "one", "done"). Only fuzz words of 6+ letters.
			fuzzy: (term) => (term.length >= 6 ? 0.2 : false),
			combineWith: 'AND'
		}
	});
	index.addAll(cards);

	const byId = new Map(cards.map((card) => [card.id, card]));

	return (query) => {
		if (!query.trim()) return cards;
		return index.search(query).map((result) => byId.get(result.id)!);
	};
}
