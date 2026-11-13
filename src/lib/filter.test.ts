import { describe, it, expect } from 'vitest';
import type { AffinityColor, Card, HitLocation } from '$lib/types';
import type { AffinityKey, Clause, ClauseOp } from './query';
import { affinityColor, matchesClause } from './filter';

const cloth: Card = {
	id: 'cloth',
	name: 'Cloth',
	expansion: 'core',
	source: 'sg',
	armor_value: 1,
	hit_location: ['waist'],
	center_affinity: 'blue'
};
const helm: Card = {
	id: 'helm',
	name: 'Crimson Helm',
	expansion: 'gce',
	source: 'rg',
	armor_value: 2,
	hit_location: ['head', 'chest'],
	affinities: { up: 'green', left: 'green', down: 'blue' }
};
const blade: Card = {
	id: 'blade',
	name: 'Bone Blade',
	expansion: 'core',
	source: 'bm',
	weapon_stats: { speed: 2, accuracy: 6, strength: 2 },
	affinities: { left: 'red' }
};
/** A weapon with a variable speed ("*"), no strength on the card and no source. */
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
const src = (...values: string[]): Clause => ({ key: 'src', op: '=', values, negated: false });
const aff = (key: AffinityKey, ...values: AffinityColor[]): Clause => ({
	key,
	op: '=',
	values,
	negated: false
});
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
		it("matches any of the card's locations", () => {
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

	describe('source (src)', () => {
		it('matches the source id', () => {
			expect(matching(src('bm'))).toEqual(['blade']);
		});

		it('needs the whole id, not its start or the source name', () => {
			expect(matching(src('b'))).toEqual([]);
			expect(matching(src('bone-smith'))).toEqual([]);
		});

		it('ORs the values of a comma list', () => {
			expect(matching(src('bm', 'rg'))).toEqual(['helm', 'blade']);
		});

		it('flips only among cards with a source when negated', () => {
			expect(matching(not(src('bm')))).toEqual(['cloth', 'helm']);
		});
	});

	describe('affinities (up, right, down, left, center)', () => {
		it('matches the color on that edge', () => {
			expect(matching(aff('left', 'red'))).toEqual(['blade']);
			expect(matching(aff('up', 'green'))).toEqual(['helm']);
		});

		it('only looks at the edge in the key', () => {
			expect(matching(aff('right', 'red'))).toEqual([]);
			expect(matching(aff('down', 'green'))).toEqual([]);
		});

		it('ORs the colors of a comma list', () => {
			expect(matching(aff('left', 'red', 'green'))).toEqual(['helm', 'blade']);
		});

		it('reads the center square for "center", not the edges', () => {
			expect(matching(aff('center', 'blue'))).toEqual(['cloth']);
			expect(matching(aff('center', 'red'))).toEqual([]);
		});

		it('flips only among cards with a color on that spot when negated', () => {
			// -left:red: has a left affinity, and it is not red.
			expect(matching(not(aff('left', 'red')))).toEqual(['helm']);
		});
	});
});

describe('affinityColor', () => {
	it('reads an edge from the affinities', () => {
		expect(affinityColor(helm, 'up')).toBe('green');
		expect(affinityColor(helm, 'down')).toBe('blue');
	});

	it('reads the center square for "center"', () => {
		expect(affinityColor(cloth, 'center')).toBe('blue');
	});

	it('is undefined for a blank edge or a card without affinities', () => {
		expect(affinityColor(helm, 'right')).toBeUndefined();
		expect(affinityColor(oddWeapon, 'up')).toBeUndefined();
		expect(affinityColor(blade, 'center')).toBeUndefined();
	});
});
