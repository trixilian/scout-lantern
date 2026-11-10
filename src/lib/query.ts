import { HIT_LOCATIONS, type HitLocation } from '$lib/types';

export type Clause = ExpansionClause | NumberClause | LocationClause;

export type ClauseOp = '=' | '<' | '>' | '<=' | '>=';

export interface ExpansionClause {
	key: 'e';
	values: string[];
	negated: boolean;
	op: '=';
}

export interface NumberClause {
	key: 'arm' | 'str' | 'acc' | 'spd';
	values: number[];
	negated: boolean;
	op: ClauseOp;
}

export interface LocationClause {
	key: 'loc';
	values: HitLocation[];
	negated: boolean;
	op: '=';
}

/**
 * One search word as a clause: optional "-", a key of letters, an operator, the rest.
 * "<=" and ">=" come before "<" and ">" so "arm<=4" isn't read as "<" with value "=4".
 * Groups: [1] "-" or "", [2] key, [3] operator, [4] values (may be empty).
 */
const CLAUSE = /^(-?)([a-z]+)(<=|>=|:|=|<|>)(.*)$/i;

/** Every operator the regex can return, mapped to its ClauseOp (":" means the same as "="). */
const OPS: Record<string, ClauseOp> = {
	':': '=',
	'=': '=',
	'<': '<',
	'>': '>',
	'<=': '<=',
	'>=': '>='
};

const CLAUSE_KEYS = {
	e: 'text',
	arm: 'number',
	str: 'number',
	acc: 'number',
	spd: 'number',
	loc: 'text'
} as const;

export type ClauseKey = keyof typeof CLAUSE_KEYS;

// Object.hasOwn instead of `in`: `in` also finds inherited names like "constructor".
const isClauseKey = (key: string): key is ClauseKey => Object.hasOwn(CLAUSE_KEYS, key);

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
		const op = OPS[rawOp];
		const values = rest
			.toLowerCase()
			.split(',')
			.filter((v) => v !== '');

		// Each check drops the whole term with one warning that quotes it as typed.
		if (!isClauseKey(key)) {
			warn(`Unknown filter "${key}" in "${part}"`);
			continue;
		}
		const kind = CLAUSE_KEYS[key];
		if (values.length === 0) {
			warn(`No value in "${part}"`);
			continue;
		}
		if (kind === 'text' && op !== '=') {
			warn(`Only ":" or "=" works for "${key}", in "${part}"`);
			continue;
		}
		if (op !== '=' && values.length > 1) {
			warn(`A comparison takes a single value, in "${part}"`);
			continue;
		}
		// Number keys only take whole numbers: digits only, from start to end.
		if (kind === 'number' && !values.every((v) => /^\d+$/.test(v))) {
			warn(`Not a whole number in "${part}"`);
			continue;
		}

		switch (key) {
			case 'e':
				clauses.push({ key, op: '=', values, negated });
				break;
			case 'arm':
			case 'str':
			case 'acc':
			case 'spd':
				clauses.push({ key, op, values: values.map((v) => parseInt(v)), negated });
				break;
			case 'loc':
				// every() with a type guard narrows `values` to HitLocation[] when it passes.
				if (!values.every(isHitLocation)) {
					warn(`Unknown hit location in "${part}"`);
					continue;
				}
				clauses.push({ key, op: '=', values, negated });
				break;
		}
	}

	return {
		clauses: clauses,
		text: text.trim(),
		warnings: warnings
	};
};
