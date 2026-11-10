import { describe, it, expect } from 'vitest';
import { parseQuery } from './query';

describe('parseQuery', () => {
	describe('free text', () => {
		it('returns an empty result for an empty query', () => {
			expect(parseQuery('')).toEqual({ text: '', clauses: [], warnings: [] });
			expect(parseQuery('   ')).toEqual({ text: '', clauses: [], warnings: [] });
		});

		it('passes plain words through as text', () => {
			expect(parseQuery('bone blade')).toEqual({
				text: 'bone blade',
				clauses: [],
				warnings: []
			});
		});

		it('collapses extra whitespace in the text', () => {
			expect(parseQuery('  bone   blade  ').text).toBe('bone blade');
		});

		it('keeps the case of the text (the search is case-insensitive anyway)', () => {
			expect(parseQuery('Bone Blade').text).toBe('Bone Blade');
		});

		it('keeps a leading "-" on a plain word as text', () => {
			expect(parseQuery('-bone')).toEqual({ text: '-bone', clauses: [], warnings: [] });
		});

		it('keeps a word that only starts with an operator as text', () => {
			expect(parseQuery('>3').text).toBe('>3');
		});
	});

	describe('clauses', () => {
		it('parses a single key:value', () => {
			expect(parseQuery('e:gce')).toEqual({
				text: '',
				clauses: [{ key: 'e', op: '=', values: ['gce'], negated: false }],
				warnings: []
			});
		});

		it('treats "=" the same as ":"', () => {
			expect(parseQuery('e=gce').clauses).toEqual([
				{ key: 'e', op: '=', values: ['gce'], negated: false }
			]);
		});

		it('parses a comma list of values', () => {
			expect(parseQuery('e:core,gce').clauses).toEqual([
				{ key: 'e', op: '=', values: ['core', 'gce'], negated: false }
			]);
		});

		it('parses a leading "-" as negation', () => {
			expect(parseQuery('-e:core,gce').clauses).toEqual([
				{ key: 'e', op: '=', values: ['core', 'gce'], negated: true }
			]);
		});

		it('lower-cases keys and values', () => {
			expect(parseQuery('E:GCE').clauses).toEqual([
				{ key: 'e', op: '=', values: ['gce'], negated: false }
			]);
		});

		it('keeps repeated keys as separate clauses, in query order', () => {
			expect(parseQuery('e:core -e:gce').clauses).toEqual([
				{ key: 'e', op: '=', values: ['core'], negated: false },
				{ key: 'e', op: '=', values: ['gce'], negated: true }
			]);
		});

		it('ignores empty values in a comma list', () => {
			expect(parseQuery('e:core,').clauses).toEqual([
				{ key: 'e', op: '=', values: ['core'], negated: false }
			]);
			expect(parseQuery('e:core,,gce').clauses).toEqual([
				{ key: 'e', op: '=', values: ['core', 'gce'], negated: false }
			]);
		});

		it('separates text and clauses wherever they appear', () => {
			expect(parseQuery('bone e:gce blade')).toEqual({
				text: 'bone blade',
				clauses: [{ key: 'e', op: '=', values: ['gce'], negated: false }],
				warnings: []
			});
		});
	});

	describe('numeric clauses (arm)', () => {
		it('parses arm:N and arm=N as equality', () => {
			const expected = [{ key: 'arm', op: '=', values: [2], negated: false }];
			expect(parseQuery('arm:2').clauses).toEqual(expected);
			expect(parseQuery('arm=2').clauses).toEqual(expected);
		});

		it('parses a comma list of numbers', () => {
			expect(parseQuery('arm:1,2').clauses).toEqual([
				{ key: 'arm', op: '=', values: [1, 2], negated: false }
			]);
		});

		it('parses < and >', () => {
			expect(parseQuery('arm<4').clauses).toEqual([
				{ key: 'arm', op: '<', values: [4], negated: false }
			]);
			expect(parseQuery('arm>4').clauses).toEqual([
				{ key: 'arm', op: '>', values: [4], negated: false }
			]);
		});

		it('parses <= and >= (not as < or > followed by "=")', () => {
			expect(parseQuery('arm<=4').clauses).toEqual([
				{ key: 'arm', op: '<=', values: [4], negated: false }
			]);
			expect(parseQuery('arm>=4').clauses).toEqual([
				{ key: 'arm', op: '>=', values: [4], negated: false }
			]);
		});

		it('parses a negated comparison', () => {
			expect(parseQuery('-arm>5').clauses).toEqual([
				{ key: 'arm', op: '>', values: [5], negated: true }
			]);
		});

		it('lower-cases the key of a comparison', () => {
			expect(parseQuery('ARM>=3').clauses).toEqual([
				{ key: 'arm', op: '>=', values: [3], negated: false }
			]);
		});

		it('parses the weapon stats the same way', () => {
			expect(parseQuery('str>=3 spd:2 acc<7').clauses).toEqual([
				{ key: 'str', op: '>=', values: [3], negated: false },
				{ key: 'spd', op: '=', values: [2], negated: false },
				{ key: 'acc', op: '<', values: [7], negated: false }
			]);
		});

		it('combines with text and other clauses', () => {
			expect(parseQuery('bone arm>=2 -e:gce')).toEqual({
				text: 'bone',
				clauses: [
					{ key: 'arm', op: '>=', values: [2], negated: false },
					{ key: 'e', op: '=', values: ['gce'], negated: true }
				],
				warnings: []
			});
		});
	});

	describe('hit location clauses (loc)', () => {
		it('parses a location', () => {
			expect(parseQuery('loc:head').clauses).toEqual([
				{ key: 'loc', op: '=', values: ['head'], negated: false }
			]);
		});

		it('parses a comma list, lower-cased', () => {
			expect(parseQuery('-LOC:Head,ARMS').clauses).toEqual([
				{ key: 'loc', op: '=', values: ['head', 'arms'], negated: true }
			]);
		});
	});

	describe('warnings', () => {
		// Only the number of warnings and the term they name are checked, not the exact wording.

		const dropped = (query: string, term: string) => {
			const parsed = parseQuery(query);
			expect(parsed.clauses).toEqual([]);
			expect(parsed.warnings).toHaveLength(1);
			expect(parsed.warnings[0]).toContain(term);
			return parsed;
		};

		it('warns about a key without a value and drops the term', () => {
			expect(dropped('bone e:', 'e:').text).toBe('bone');
		});

		it('treats a comma list with only empty values as no value', () => {
			dropped('-e:,', 'e:');
		});

		it('warns about an unknown key and drops the term', () => {
			expect(dropped('foo:bar bone', 'foo').text).toBe('bone');
			dropped('foo>3', 'foo');
		});

		it('warns about a comparison on a key that only allows ":" / "="', () => {
			dropped('e>gce', 'e>gce');
			dropped('e<=core', 'e<=core');
		});

		it('warns about a comparison without a value', () => {
			dropped('arm>', 'arm>');
			dropped('arm>=', 'arm>=');
		});

		it('warns about a comparison with more than one value', () => {
			dropped('arm>1,2', 'arm>1,2');
		});

		it('warns about a non-number value and drops the whole term', () => {
			dropped('arm>=x', 'arm>=x');
			dropped('arm:1,x', 'arm:1,x');
			dropped('arm:1.5', 'arm:1.5');
		});

		it('warns about an unknown hit location and drops the whole term', () => {
			dropped('loc:foot', 'loc:foot');
			dropped('loc:head,foot', 'loc:head,foot');
		});

		it('warns about a comparison on a location', () => {
			dropped('loc>head', 'loc>head');
		});

		it('collects one warning per bad term and still parses the good ones', () => {
			const parsed = parseQuery('foo:bar e: e:gce arm>x arm<3');
			expect(parsed.clauses).toEqual([
				{ key: 'e', op: '=', values: ['gce'], negated: false },
				{ key: 'arm', op: '<', values: [3], negated: false }
			]);
			expect(parsed.warnings).toHaveLength(3);
		});
	});
});
