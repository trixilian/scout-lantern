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
		sources: [],
		hitLocations: [],
		affinities: { up: null, right: null, down: null, left: null, center: null },
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

	it('lists the source ids in one src: filter', () => {
		expect(buildQuery(form({ sources: ['c'] }))).toBe('src:c');
		expect(buildQuery(form({ sources: ['bm', 'rg'] }))).toBe('src:bm,rg');
	});

	it('lists the hit locations in one loc: filter', () => {
		expect(buildQuery(form({ hitLocations: ['head', 'arms'] }))).toBe('loc:head,arms');
	});

	it('writes one filter per affinity spot with a color', () => {
		const affinities = { ...form().affinities, up: 'red' as const, center: 'blue' as const };
		expect(buildQuery(form({ affinities }))).toBe('up:red center:blue');
	});

	it('writes the affinities in edge order: up, right, down, left, then center', () => {
		const affinities = {
			center: 'green' as const,
			left: 'red' as const,
			down: 'blue' as const,
			right: 'green' as const,
			up: 'red' as const
		};
		expect(buildQuery(form({ affinities }))).toBe(
			'up:red right:green down:blue left:red center:green'
		);
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

	it('puts the text first, then e:, src:, the stats, loc: and the affinities', () => {
		const stats = { ...stat('arm', '>=', 2), spd: { op: '<' as const, value: 3 } };
		expect(
			buildQuery(
				form({
					text: 'bone',
					expansions: ['core'],
					sources: ['bm'],
					hitLocations: ['head'],
					affinities: { ...form().affinities, left: 'red' },
					stats
				})
			)
		).toBe('bone e:core src:bm arm>=2 spd<3 loc:head left:red');
	});

	it('builds a query that parseQuery reads back without warnings', () => {
		const stats = { ...stat('arm', '>=', 2), acc: { op: '<=' as const, value: 6 } };
		const parsed = parseQuery(
			buildQuery(
				form({
					text: 'crimson',
					expansions: ['gce'],
					sources: ['rg'],
					hitLocations: ['legs'],
					affinities: { ...form().affinities, up: 'green' },
					stats
				})
			)
		);
		expect(parsed.warnings).toEqual([]);
		expect(parsed.text).toBe('crimson');
		expect(parsed.clauses).toEqual([
			{ key: 'e', op: '=', values: ['gce'], negated: false },
			{ key: 'src', op: '=', values: ['rg'], negated: false },
			{ key: 'arm', op: '>=', values: [2], negated: false },
			{ key: 'acc', op: '<=', values: [6], negated: false },
			{ key: 'loc', op: '=', values: ['legs'], negated: false },
			{ key: 'up', op: '=', values: ['green'], negated: false }
		]);
	});
});
