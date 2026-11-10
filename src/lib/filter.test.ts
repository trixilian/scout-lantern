import { describe, it, expect } from 'vitest';
import type { Card, HitLocation } from '$lib/types';
import type { Clause, ClauseOp } from './query';
import { matchesClause } from './filter';

const cloth: Card = {
	id: 'cloth',
	name: 'Cloth',
	expansion: 'core',
	armor_value: 1,
	hit_location: ['waist']
};
const helm: Card = {
	id: 'helm',
	name: 'Crimson Helm',
	expansion: 'gce',
	armor_value: 2,
	hit_location: ['head', 'chest']
};
const blade: Card = {
	id: 'blade',
	name: 'Bone Blade',
	expansion: 'core',
	weapon_stats: { speed: 2, accuracy: 6, strength: 2 }
};
/** A weapon with a variable speed ("*") and no strength on the card. */
const oddWeapon: Card = {
	id: 'odd',
	name: 'Odd Weapon',
	expansion: 'gce',
	weapon_stats: { speed: '*', accuracy: 5 }
};

// One builder per kind of clause, so each gets the value type the parser produces.
const e = (...values: string[]): Clause => ({ key: 'e', op: '=', values, negated: false });
const num = (key: 'arm' | 'spd' | 'acc' | 'str', op: ClauseOp, ...values: number[]): Clause => ({
	key,
	op,
	values,
	negated: false
});
const loc = (...values: HitLocation[]): Clause => ({ key: 'loc', op: '=', values, negated: false });
const not = (c: Clause): Clause => ({ ...c, negated: true });

/** Ids of the cards that match, in the order given. */
const matching = (c: Clause, cards = [cloth, helm, blade, oddWeapon]) =>
	cards.filter((card) => matchesClause(card, c)).map((card) => card.id);

describe('matchesClause', () => {
	describe('expansion (e)', () => {
		it('matches the given expansion', () => {
			expect(matching(e('core'))).toEqual(['cloth', 'blade']);
		});

		it('ORs the values of a comma list', () => {
			expect(matching(e('core', 'gce'))).toEqual(['cloth', 'helm', 'blade', 'odd']);
		});

		it('flips the result when negated', () => {
			expect(matching(not(e('gce')))).toEqual(['cloth', 'blade']);
		});

		it('matches nothing for an expansion that does not exist', () => {
			expect(matching(e('xyz'))).toEqual([]);
		});
	});

	describe('armor value (arm)', () => {
		it('compares with =, also for a comma list', () => {
			expect(matching(num('arm', '=', 1))).toEqual(['cloth']);
			expect(matching(num('arm', '=', 1, 2))).toEqual(['cloth', 'helm']);
		});

		it('compares with < and >', () => {
			expect(matching(num('arm', '<', 2))).toEqual(['cloth']);
			expect(matching(num('arm', '>', 1))).toEqual(['helm']);
		});

		it('compares with <= and >=', () => {
			expect(matching(num('arm', '<=', 2))).toEqual(['cloth', 'helm']);
			expect(matching(num('arm', '>=', 2))).toEqual(['helm']);
		});

		it('never matches a card without armor', () => {
			expect(matching(num('arm', '<', 10), [blade])).toEqual([]);
		});

		it('flips only among cards with armor when negated', () => {
			// -arm>1: has armor, and armor is not above 1.
			expect(matching(not(num('arm', '>', 1)))).toEqual(['cloth']);
		});
	});

	describe('weapon stats (spd, acc, str)', () => {
		it('reads speed, accuracy and strength', () => {
			expect(matching(num('spd', '=', 2))).toEqual(['blade']);
			expect(matching(num('acc', '<', 6))).toEqual(['odd']);
			expect(matching(num('str', '>=', 2))).toEqual(['blade']);
		});

		it('never matches a missing stat or a "*" stat, negated or not', () => {
			expect(matching(num('str', '<', 10), [oddWeapon])).toEqual([]);
			expect(matching(not(num('spd', '=', 2)), [oddWeapon])).toEqual([]);
			expect(matching(num('spd', '<', 10), [oddWeapon])).toEqual([]);
		});

		it('never matches a card without weapon stats', () => {
			expect(matching(num('acc', '>', 0), [cloth, helm])).toEqual([]);
		});
	});

	describe('hit location (loc)', () => {
		it('matches any of the card’s locations', () => {
			expect(matching(loc('head'))).toEqual(['helm']);
			expect(matching(loc('chest'))).toEqual(['helm']);
		});

		it('ORs the values of a comma list', () => {
			expect(matching(loc('head', 'waist'))).toEqual(['cloth', 'helm']);
		});

		it('flips only among cards with a location when negated', () => {
			expect(matching(not(loc('head')))).toEqual(['cloth']);
		});
	});
});
