import { HIT_LOCATIONS, type HitLocation } from '$lib/types';
import { isNumberKey, type NumberKey } from './filter';

/** The comparison operators, in the order the advanced search form lists them. */
export const CLAUSE_OPS = ['=', '<', '>', '<=', '>='] as const;

export type ClauseOp = (typeof CLAUSE_OPS)[number];

/** A number filter, e.g. `arm>=3` (see NUMBER_FILTERS). */
export interface NumberClause {
	key: NumberKey;
	values: number[];
	negated: boolean;
	op: ClauseOp;
}

export interface ExpansionClause {
	key: 'e';
	values: string[];
	negated: boolean;
	op: '=';
}

export interface LocationClause {
	key: 'loc';
	values: HitLocation[];
	negated: boolean;
	op: '=';
}

export type Clause = NumberClause | ExpansionClause | LocationClause;

/**
 * One search word as a clause: optional "-", a key of letters, an operator, the rest.
 * "<=" and ">=" come before "<" and ">" so "arm<=4" isn't read as "<" with value "=4".
 * Groups: [1] "-" or "", [2] key, [3] operator, [4] values (may be empty).
 */
const CLAUSE = /^(-?)([a-z]+)(<=|>=|:|=|<|>)(.*)$/i;

/** Every operator the regex can return, mapped to its ClauseOp (":" means the same as "="). */
const OP_FROM_SYMBOL: Record<string, ClauseOp> = {
	':': '=',
	'=': '=',
	'<': '<',
	'>': '>',
	'<=': '<=',
	'>=': '>='
};

/** Keys that match a list of names and so only take ":" or "=". */
const isListKey = (key: string): key is 'e' | 'loc' => key === 'e' || key === 'loc';

// Widened to readonly string[]: on the `as const` tuple, includes() only accepts the five names.
const isHitLocation = (value: string): value is HitLocation =>
	(HIT_LOCATIONS as readonly string[]).includes(value);

export interface ParsedQuery {
	clauses: Clause[];
	text: string;
	warnings: string[];
}

export const parseQuery = (query: string): ParsedQuery => {
	const queryTrimmed = query.replace(/\s+/g, ' ').trim();
	const separated = queryTrimmed.split(' ');
	const clauses: Clause[] = [];
	let text: string = '';
	const warnings: string[] = [];
	const warn = (message: string) => {
		warnings.push(message);
		console.warn(message);
	};

	for (const part of separated) {
		const match = part.match(CLAUSE);
		if (!match) {
			// It's just text
			text += part + ' ';
			continue;
		}

		// Clause found
		const [, minus, rawKey, rawOp, rest] = match;
		const negated = minus === '-';
		const key = rawKey.toLowerCase();
		const op = OP_FROM_SYMBOL[rawOp];
		const values = rest
			.toLowerCase()
			.split(',')
			.filter((v) => v !== '');

		// Each check drops the whole term with one warning that quotes it as typed.
		if (!isNumberKey(key) && !isListKey(key)) {
			warn(`Unknown filter "${key}" in "${part}"`);
			continue;
		}
		if (values.length === 0) {
			warn(`No value in "${part}"`);
			continue;
		}
		if (isListKey(key) && op !== '=') {
			warn(`Only ":" or "=" works for "${key}", in "${part}"`);
			continue;
		}
		if (op !== '=' && values.length > 1) {
			warn(`A comparison takes a single value, in "${part}"`);
			continue;
		}

		if (isNumberKey(key)) {
			// Number keys only take whole numbers: digits only, from start to end.
			if (!values.every((v) => /^\d+$/.test(v))) {
				warn(`Not a whole number in "${part}"`);
				continue;
			}
			clauses.push({ key, op, values: values.map((v) => parseInt(v)), negated });
		} else if (key === 'loc') {
			// every() with a type guard narrows `values` to HitLocation[] when it passes.
			if (!values.every(isHitLocation)) {
				warn(`Unknown hit location in "${part}"`);
				continue;
			}
			clauses.push({ key, op: '=', values, negated });
		} else {
			clauses.push({ key, op: '=', values, negated });
		}
	}

	return {
		clauses: clauses,
		text: text.trim(),
		warnings: warnings
	};
};
