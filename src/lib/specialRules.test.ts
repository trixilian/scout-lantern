import { describe, it, expect } from 'vitest';
import { formatSpecialRule } from './specialRules';

describe('formatSpecialRule', () => {
	it('shows only the name of a rule without a value', () => {
		expect(formatSpecialRule({ name: 'Frail' })).toBe('Frail');
		expect(formatSpecialRule({ name: 'Grace of Power' })).toBe('Grace of Power');
	});

	it('adds a number value after a space', () => {
		expect(formatSpecialRule({ name: 'Reach', value: 2 })).toBe('Reach 2');
		expect(formatSpecialRule({ name: 'Clobber', value: 15 })).toBe('Clobber 15');
	});

	it('adds a text value after a space', () => {
		expect(formatSpecialRule({ name: 'Barbed', value: '1d10' })).toBe('Barbed 1d10');
	});

	it('keeps a value of 0', () => {
		expect(formatSpecialRule({ name: 'Deflect', value: 0 })).toBe('Deflect 0');
	});

	it('joins a meal and its monster with " - ", as printed on the card', () => {
		expect(formatSpecialRule({ name: 'Meal', value: 'Phoenix' })).toBe('Meal - Phoenix');
		expect(formatSpecialRule({ name: 'Meal', value: 'Screaming Antelope' })).toBe(
			'Meal - Screaming Antelope'
		);
	});

	it('shows a meal without a monster as just "Meal"', () => {
		expect(formatSpecialRule({ name: 'Meal' })).toBe('Meal');
	});
});
