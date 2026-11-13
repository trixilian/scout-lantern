import type { AffinityColor, Card, Stat } from '$lib/types';
import type { AffinityKey, Clause, ClauseOp } from './query';

interface NumberFilter {
	/** Shown in the advanced search form. */
	label: string;
	/** The card's number. A card without it never matches, so `-arm=2` skips weapons. */
	get: (card: Card) => Stat | undefined;
}

/**
 * The filters that compare one number on the card (`arm>=3`, `spd=2`), by query key.
 * The parser, the filtering below, the advanced search form and buildQuery all read this
 * table, so a new number filter is one new row here.
 */
export const NUMBER_FILTERS = {
	spd: { label: 'Speed', get: (card) => card.weapon_stats?.speed },
	acc: { label: 'Accuracy', get: (card) => card.weapon_stats?.accuracy },
	str: { label: 'Strength', get: (card) => card.weapon_stats?.strength },
	arm: { label: 'Armor value', get: (card) => card.armor_value }
} satisfies Record<string, NumberFilter>;

export type NumberKey = keyof typeof NUMBER_FILTERS;

// Object.hasOwn instead of `in`: `in` also finds inherited names like "constructor".
export const isNumberKey = (key: string): key is NumberKey => Object.hasOwn(NUMBER_FILTERS, key);

const compare = (cardValue: number, op: ClauseOp, value: number): boolean => {
	switch (op) {
		case '=':
			return cardValue === value;
		case '<':
			return cardValue < value;
		case '>':
			return cardValue > value;
		case '<=':
			return cardValue <= value;
		case '>=':
			return cardValue >= value;
	}
};

/**
 * The card's color for an affinity key: an edge from `affinities`, or `center_affinity` for
 * "center". undefined when that spot has no color.
 */
export const affinityColor = (card: Card, key: AffinityKey): AffinityColor | undefined => {
	if (key === 'center') return card.center_affinity;
	// Here key is one of the four edges; ?. gives undefined when the card has no affinities.
	return card.affinities?.[key];
};

export const matchesClause = (card: Card, clause: Clause): boolean => {
	switch (clause.key) {
		case 'e': {
			const match = clause.values.includes(card.expansion.toLowerCase());
			return clause.negated ? !match : match;
		}
		case 'loc': {
			const cardValues = card.hit_location;
			if (cardValues === undefined) return false; // No hit location on this card
			const match = clause.values.some((v) => cardValues.includes(v));
			return clause.negated ? !match : match;
		}
		case 'src': {
			if (card.source === undefined) return false; // No source on this card
			// Source ids are lowercase, and so are the values from the parser.
			const match = clause.values.includes(card.source);
			return clause.negated ? !match : match;
		}
		case 'up':
		case 'right':
		case 'down':
		case 'left':
		case 'center': {
			const color = affinityColor(card, clause.key);
			if (color === undefined) return false; // No color on this spot
			const match = clause.values.includes(color);
			return clause.negated ? !match : match;
		}
		default: {
			// Every other clause is a number clause; TypeScript narrows `clause` to it here.
			const cardValue = NUMBER_FILTERS[clause.key].get(card);
			if (cardValue === undefined) return false;
			if (cardValue === '*') return false; // A variable stat can't be compared
			const match = clause.values.some((v) => compare(cardValue, clause.op, v));
			return clause.negated ? !match : match;
		}
	}
};
