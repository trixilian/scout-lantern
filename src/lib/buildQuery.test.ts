import { describe, it, expect } from 'vitest';
import { buildQuery } from './buildQuery';
import { parseQuery } from './query';

/** The form type, taken from buildQuery's parameter. */
type Form = Parameters<typeof buildQuery>[0];

/** An empty advanced-search form with some fields filled in. */
function form(fields: Partial<Form> = {}): Form {
	return {
		text: '',
		expansions: [],
		hitLocations: [],
		stats: {
			arm: { op: '=', value: null },
			str: { op: '=', value: null },
			acc: { op: '=', value: null },
			spd: { op: '=', value: null }
		},
		...fields
	};
}

/** The stats of an empty form, with one stat set. */
function stat(key: keyof Form['stats'], op: Form['stats']['arm']['op'], value: number) {
	return { ...form().stats, [key]: { op, value } };
}

describe('buildQuery', () => {
	it('returns an empty query for an empty form', () => {
		expect(buildQuery(form())).toBe('');
	});

	it('keeps the text, without spaces around it', () => {
		expect(buildQuery(form({ text: '  bone blade ' }))).toBe('bone blade');
		expect(buildQuery(form({ text: '   ' }))).toBe('');
	});

	it('lists the expansions in one e: filter', () => {
		expect(buildQuery(form({ expansions: ['gce'] }))).toBe('e:gce');
		expect(buildQuery(form({ expansions: ['core', 'gce'] }))).toBe('e:core,gce');
	});

	it('leaves out e: when every expansion the form offers is checked', () => {
		const all = ['core', 'gce'];
		expect(buildQuery(form({ expansions: ['core', 'gce'] }), all)).toBe('');
		expect(buildQuery(form({ expansions: ['gce'] }), all)).toBe('e:gce');
	});

	it('lists the hit locations in one loc: filter', () => {
		expect(buildQuery(form({ hitLocations: ['head', 'arms'] }))).toBe('loc:head,arms');
	});

	it('writes a stat with its operator', () => {
		expect(buildQuery(form({ stats: stat('arm', '>=', 2) }))).toBe('arm>=2');
		expect(buildQuery(form({ stats: stat('spd', '<', 3) }))).toBe('spd<3');
		expect(buildQuery(form({ stats: stat('str', '=', 5) }))).toBe('str=5');
	});

	it('leaves out a stat without a value (an empty or cleared number field is null)', () => {
		const stats = { ...form().stats, acc: { op: '>' as const, value: null } };
		expect(buildQuery(form({ stats }))).toBe('');
	});

	it('keeps a stat value of 0', () => {
		expect(buildQuery(form({ stats: stat('arm', '=', 0) }))).toBe('arm=0');
	});

	it('puts the text first, then e:, the stats and loc:', () => {
		const stats = { ...stat('arm', '>=', 2), spd: { op: '<' as const, value: 3 } };
		expect(
			buildQuery(form({ text: 'bone', expansions: ['core'], hitLocations: ['head'], stats }))
		).toBe('bone e:core arm>=2 spd<3 loc:head');
	});

	it('builds a query that parseQuery reads back without warnings', () => {
		const stats = { ...stat('arm', '>=', 2), acc: { op: '<=' as const, value: 6 } };
		const parsed = parseQuery(
			buildQuery(form({ text: 'crimson', expansions: ['gce'], hitLocations: ['legs'], stats }))
		);
		expect(parsed.warnings).toEqual([]);
		expect(parsed.text).toBe('crimson');
		expect(parsed.clauses).toEqual([
			{ key: 'e', op: '=', values: ['gce'], negated: false },
			{ key: 'arm', op: '>=', values: [2], negated: false },
			{ key: 'acc', op: '<=', values: [6], negated: false },
			{ key: 'loc', op: '=', values: ['legs'], negated: false }
		]);
	});
});
