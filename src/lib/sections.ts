import type { Card } from './types';

export type Group = {
	expansion: string;
	cards: Card[];
};

export const groupByExpansion = (cards: Card[], expansionIds: string[]): Group[] => {
	// One empty group per expansion, already in the right order.
	const groups: Group[] = expansionIds.map((id) => ({ expansion: id, cards: [] }));

	for (const card of cards) {
		let group = groups.find((g) => g.expansion === card.expansion);
		if (!group) {
			// An expansion missing from expansionIds: a new group at the end.
			group = { expansion: card.expansion, cards: [] };
			groups.push(group);
		}
		group.cards.push(card);
	}

	return groups.filter((g) => g.cards.length > 0);
};
