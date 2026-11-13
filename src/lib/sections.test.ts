import { describe, it, expect } from 'vitest';
import type { Card } from '$lib/types';
import { groupByExpansion } from './sections';

const card = (id: string, expansion: string): Card => ({ id, name: id, expansion });

/** The groups as [expansion, card ids] pairs, short to compare. */
const grouped = (cards: Card[], expansionIds: string[]) =>
	groupByExpansion(cards, expansionIds).map((group) => [
		group.expansion,
		group.cards.map((c) => c.id)
	]);

describe('groupByExpansion', () => {
	it('returns no groups for no cards', () => {
		expect(groupByExpansion([], ['core', 'gce'])).toEqual([]);
	});

	it('puts the cards of each expansion in one group', () => {
		const cards = [card('a', 'core'), card('b', 'gce'), card('c', 'core')];
		expect(grouped(cards, ['core', 'gce'])).toEqual([
			['core', ['a', 'c']],
			['gce', ['b']]
		]);
	});

	it('orders the groups like `expansionIds`, not by the first card', () => {
		const cards = [card('a', 'gce'), card('b', 'core')];
		expect(grouped(cards, ['core', 'gce'])).toEqual([
			['core', ['b']],
			['gce', ['a']]
		]);
	});

	it('keeps the order of the cards inside a group (the search ranking)', () => {
		const cards = [card('c', 'core'), card('a', 'core'), card('b', 'core')];
		expect(grouped(cards, ['core'])).toEqual([['core', ['c', 'a', 'b']]]);
	});

	it('leaves out expansions without cards', () => {
		expect(grouped([card('a', 'gce')], ['core', 'gce'])).toEqual([['gce', ['a']]]);
	});

	it('keeps cards of an expansion missing from `expansionIds`, in groups at the end', () => {
		const cards = [card('a', 'xyz'), card('b', 'core')];
		expect(grouped(cards, ['core'])).toEqual([
			['core', ['b']],
			['xyz', ['a']]
		]);
	});
});
