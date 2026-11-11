import MiniSearch from 'minisearch';
import type { Card } from '$lib/types';
import type { ParsedQuery } from './query';
import { matchesClause } from './filter';

export type Search = (query: ParsedQuery) => Card[];

/**
 * Builds a full-text index over `cards` and returns a search function.
 *
 * The search takes a parsed query (see `parseQuery`). Its text goes to the full-text index:
 * every word must match (AND), each word may be a prefix ("bon" finds "Bone Blade"), and words
 * allow a small typo. Empty text starts from every card, in data order. The
 * clauses then filter those candidates: a card stays only if it matches every clause.
 * Callers only see `search(parsedQuery)`, so the engine can be swapped.
 */
export function createSearch(cards: Card[]): Search {
	const index = new MiniSearch<Card>({
		fields: ['name', 'keywords', 'special_rules', 'rules_text', 'source'],
		// Keywords are a string[]; index them as one text field.
		extractField: (card, field) => {
			const value = card[field as keyof Card];
			if (field === 'special_rules') {
				const specialRules = card.special_rules ?? [];
				return specialRules.map((rule) => rule.name).join(' ');
			}
			return Array.isArray(value) ? value.join(' ') : ((value as string | undefined) ?? '');
		},
		searchOptions: {
			boost: { name: 3, keywords: 2 },
			prefix: true,
			fuzzy: 0.2,
			combineWith: 'AND'
		}
	});
	index.addAll(cards);

	const byId = new Map(cards.map((card) => [card.id, card]));

	return (query) => {
		const candidates = query.text
			? index.search(query.text).map((result) => byId.get(result.id)!)
			: cards;
		return candidates.filter((card) =>
			query.clauses.every((clause) => matchesClause(card, clause))
		);
	};
}
