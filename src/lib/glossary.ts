import type { Glossary, GlossaryTerm } from '$lib/types';

/** A value after a rule name: "Reach 2", "Range: 6", "Barbed 1d10". */
const TRAILING_VALUE = /:?\s+\d+(d\d+)?$/;

/**
 * The glossary entry for a rule name or a term from the card text, or `undefined` when the
 * glossary has none. A value after the name is ignored, so "Reach 2" finds "Reach X".
 */
export function findTerm(glossary: Glossary, text: string): GlossaryTerm | undefined {
	const key = text.trim().replace(TRAILING_VALUE, '').toLowerCase();
	return glossary.terms[key];
}
