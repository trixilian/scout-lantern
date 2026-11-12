import { describe, it, expect } from 'vitest';
import { feedbackUrl } from './feedback';

describe('feedbackUrl', () => {
	it('links to the plain form for general feedback', () => {
		const url = new URL(feedbackUrl());

		expect(url.hostname).toBe('docs.google.com');
		expect(url.pathname).toMatch(/\/viewform$/);
		expect([...url.searchParams]).toEqual([]);
	});

	it('fills in the card id for feedback on a card', () => {
		const url = new URL(feedbackUrl('core-rg-125'));

		expect(url.searchParams.get('usp')).toBe('pp_url');
		expect(url.searchParams.get('entry.1157867948')).toBe('core-rg-125');
	});

	it('encodes the card id', () => {
		expect(feedbackUrl('a b&c')).toContain('entry.1157867948=a+b%26c');
	});
});
