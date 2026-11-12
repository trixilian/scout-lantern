import MiniSearch from 'minisearch';
import type { Card } from '$lib/types';
import type { ParsedQuery } from './query';
import { matchesClause } from './filter';
import { formatSpecialRule } from './specialRules';

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
		// Array fields become one text field each. Special rules keep their value
		// ("Barbed 2"), so a search for the rule with its number finds it.
		extractField: (card, field) => {
			const value = card[field as keyof Card];
			if (field === 'special_rules') {
				return (card.special_rules ?? []).map(formatSpecialRule).join(' ');
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
		// A word with a leading "-" leaves out the cards it matches. The search engine
		// would drop the "-" and match the word instead, so those words are split off.
		const words = query.text.split(' ').filter((word) => word !== '');
		const included = words.filter((word) => !word.startsWith('-')).join(' ');
		const excluded = words.filter((word) => word.startsWith('-')).map((word) => word.slice(1));

		const candidates = included
			? index.search(included).map((result) => byId.get(result.id)!)
			: cards;
		// No typo tolerance here: "-bane" must not also leave out every "bone" card.
		const excludedIds = new Set(
			excluded.flatMap((word) => index.search(word, { fuzzy: false }).map((result) => result.id))
		);
		return candidates.filter(
			(card) =>
				!excludedIds.has(card.id) && query.clauses.every((clause) => matchesClause(card, clause))
		);
	};
}
