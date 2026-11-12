import { describe, it, expect } from 'vitest';
import fixture from '$lib/fixtures/cards.json';
import type { CardData } from '$lib/types';
import { parseQuery } from './query';
import { createSearch } from './search';

const { cards } = fixture as CardData;
const search = createSearch(cards);
/** Search with a query string as typed in the search bar. */
const run = (query: string) => search(parseQuery(query));
const names = (query: string) => run(query).map((card) => card.name);

describe('search', () => {
	it('returns every card, in data order, for an empty query', () => {
		expect(run('')).toEqual(cards);
		expect(run('   ')).toEqual(cards);
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

	it('matches special rules', () => {
		// Special rules are not repeated in the rules text, so they need their own field.
		expect(names('frail').sort()).toEqual(['Bone Axe', 'Bone Blade']);
		expect(names('savage')).toEqual(['Bone Axe']);
		expect(names('irreplaceable')).toEqual(['Lantern Halberd']);
	});

	it('matches a special rule together with its value', () => {
		// Scrap Dagger has no "2" anywhere else, so only the indexed value can match.
		expect(names('barbed 2')).toEqual(['Scrap Dagger']);
		expect(names('barbed 3')).toEqual([]);
	});

	it('leaves out cards that match a word with a leading "-"', () => {
		expect(names('bone -axe')).not.toContain('Bone Axe');
		expect(names('bone -axe')).toContain('Bone Blade');
	});

	it('leaves out "-" words with no other text, from every card', () => {
		const withoutBone = names('-bone');
		expect(withoutBone).not.toContain('Bone Axe');
		expect(withoutBone).not.toContain('Bone Blade');
		expect(withoutBone).toContain('Cloth');
	});

	it('does not leave out typo matches of a "-" word', () => {
		// "bane" is one letter away from "bone"; excluding it must not drop the bone cards.
		expect(names('blade -bane')).toEqual(['Bone Blade']);
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
		expect(run('zzzznotacard')).toEqual([]);
	});
});

describe('search typo tolerance', () => {
	it('also allows a typo in short words', () => {
		// fuzzy 0.2 allows round(0.2 * length) edits: 1 for a 3-letter word, so "one" finds "bone".
		expect(names('one')).toContain('Bone Axe');
	});

	it('tolerates a typo in longer words', () => {
		expect(names('halbard')).toContain('Lantern Halberd');
	});
});

describe('search with clauses', () => {
	it('filters every card when there is no text', () => {
		expect(names('e:gce')).toEqual(['Crimson Slippers', 'Singing Cap']);
		expect(names('-e:core')).toEqual(['Crimson Slippers', 'Singing Cap']);
		expect(names('arm>=2')).toEqual(['Crimson Slippers', 'Singing Cap']);
	});

	it('filters the text matches', () => {
		// "set" matches Rawhide Headband (core) and both gce armor cards.
		expect(names('set e:core')).toEqual(['Rawhide Headband']);
		expect(names('bone str>=3')).toEqual(['Bone Axe']);
	});

	it('ANDs several clauses', () => {
		expect(names('e:gce arm>2')).toEqual(['Singing Cap']);
		expect(names('e:core e:gce')).toEqual([]);
	});

	it('does not send clauses to the text search', () => {
		// As text, "e:gce" would need words starting with "e" and "gce" and match nothing.
		expect(names('crimson e:gce')).toEqual(['Crimson Slippers']);
	});

	it('ignores dropped terms (they only produce warnings)', () => {
		expect(names('bone foo:bar')).toEqual(names('bone'));
	});
});
