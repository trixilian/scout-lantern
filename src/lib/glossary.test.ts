import { describe, it, expect } from 'vitest';
import type { Glossary } from '$lib/types';
import { findTerm } from './glossary';

const term = (title: string) => ({ title, text: `${title} definition.`, updated: '2020-07-01' });

const glossary: Glossary = {
	source: 'Kingdom Death: Monster Living Glossary',
	url: 'https://kingdomdeath.com/rules/living-glossary',
	copyright: '© Adam Poots Games, LLC. All rights reserved.',
	retrieved: '2026-11-11',
	terms: {
		frail: term('Frail'),
		reach: term('Reach X'),
		range: term('Range: X (Gear)'),
		barbed: term('Barbed X'),
		'razor sharp': term('Razor Sharp'),
		'ammo - bow': term('Ammo - Bow'),
		'perfect hit': term('Perfect Hit')
	}
};

describe('findTerm', () => {
	it('finds a term by its name', () => {
		expect(findTerm(glossary, 'Frail')?.title).toBe('Frail');
		expect(findTerm(glossary, 'Reach')?.title).toBe('Reach X');
	});

	it('ignores upper and lower case', () => {
		expect(findTerm(glossary, 'frail')?.title).toBe('Frail');
		expect(findTerm(glossary, 'Perfect hit')?.title).toBe('Perfect Hit');
	});

	it('finds names with several words', () => {
		expect(findTerm(glossary, 'Razor Sharp')?.title).toBe('Razor Sharp');
		expect(findTerm(glossary, 'Ammo - Bow')?.title).toBe('Ammo - Bow');
	});

	it('ignores a number value after the name', () => {
		expect(findTerm(glossary, 'Reach 2')?.title).toBe('Reach X');
	});

	it('ignores a dice value after the name', () => {
		expect(findTerm(glossary, 'Barbed 1d10')?.title).toBe('Barbed X');
	});

	it('ignores a value written with a colon, as printed on older cards', () => {
		expect(findTerm(glossary, 'Range: 6')?.title).toBe('Range: X (Gear)');
	});

	it('ignores spaces around the text', () => {
		expect(findTerm(glossary, '  Frail ')?.title).toBe('Frail');
	});

	it('returns undefined for a term without an entry', () => {
		expect(findTerm(glossary, 'Sideswipe')).toBeUndefined();
	});
});
