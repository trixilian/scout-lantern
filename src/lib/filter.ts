import type { Card } from '$lib/types';
import type { Clause } from './query';

const compare = (cardValue: number | string, op: Clause['op'], value: number | string): boolean => {
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
		default:
			return false; // Unknown operator
	}
};

export const matchesClause = (card: Card, clause: Clause): boolean => {
	const { key, op, values, negated } = clause;
	switch (key) {
		case 'e': {
			const cardValue = card.expansion.toLowerCase();
			const match = values.some((v) => compare(cardValue, op, v));
			return negated ? !match : match;
		}
		case 'arm': {
			const cardValue = card.armor_value;
			if (cardValue === undefined) return false; // No armor value on this card
			const match = values.some((v) => compare(cardValue, op, v));
			return negated ? !match : match;
		}
		case 'str':
		case 'acc':
		case 'spd': {
			const statKey = key === 'str' ? 'strength' : key === 'acc' ? 'accuracy' : 'speed';
			const cardValue = card.weapon_stats?.[statKey];
			if (cardValue === undefined) return false; // No weapon stats on this card
			if (cardValue === '*') return false; // Variable speed can't be compared
			const match = values.some((v) => compare(cardValue, op, v));
			return negated ? !match : match;
		}
		case 'loc': {
			const cardValues = card.hit_location;
			if (cardValues === undefined) return false; // No hit location on this card
			const match = values.some((v) => cardValues.includes(v));
			return negated ? !match : match;
		}
		default:
			return false; // Unknown key
	}
};
