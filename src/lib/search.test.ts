import { describe, it, expect } from 'vitest';
import fixture from '$lib/fixtures/cards.json';
import type { CardData } from '$lib/types';
import { createSearch } from './search';

const { cards } = fixture as CardData;
const search = createSearch(cards);
const names = (query: string) => search(query).map((card) => card.name);

describe('search', () => {
	it('returns every card, in data order, for an empty query', () => {
		expect(search('')).toEqual(cards);
		expect(search('   ')).toEqual(cards);
	});

	it('matches card names', () => {
		expect(names('cloth')).toEqual(['Cloth']);
	});

	it('matches a prefix of a word', () => {
		expect(names('found')).toEqual(['Founding Stone']);
	});

	it('matches keywords', () => {
		expect(names('axe')).toContain('Bone Axe');
		expect(names('stone')).toContain('Founding Stone');
	});

	it('matches rules text', () => {
		expect(names('sling')).toEqual(['Founding Stone']);
	});

	it('requires every word to match', () => {
		const bone = names('bone');
		expect(bone).toEqual(expect.arrayContaining(['Bone Blade', 'Bone Axe']));
		expect(names('bone axe')).toEqual(['Bone Axe']);
	});

	it('ranks name matches first', () => {
		expect(names('bone').slice(0, 2).sort()).toEqual(['Bone Axe', 'Bone Blade']);
	});

	it('returns nothing when no card matches', () => {
		expect(search('zzzznotacard')).toEqual([]);
	});
});

describe('search typo tolerance', () => {
	it('does not fuzz short words', () => {
		// "one" is one edit from "bone" but must not pull in every Bone card.
		expect(names('one')).not.toContain('Bone Axe');
	});

	it('tolerates a typo in longer words', () => {
		expect(names('halbard')).toContain('Lantern Halberd');
	});
});
