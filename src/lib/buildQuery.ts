import type { NumberKey } from './filter';
import type { ClauseOp } from './query';
import type { HitLocation } from './types';

export type AdvancedSearchForm = {
	text: string;
	expansions: string[];
	hitLocations: HitLocation[];
	/** `value` is null for an empty number field (Svelte's bind:value sets null when cleared). */
	stats: Record<NumberKey, { op: ClauseOp; value: number | null }>;
};

/**
 * The query string for the form. `expansionIds` are all the expansions the form offers:
 * when every one of them is checked, the e: filter would not narrow anything, so it is
 * left out.
 */
export const buildQuery = (form: AdvancedSearchForm, expansionIds: string[] = []): string => {
	const parts: string[] = [];
	const allExpansions = form.expansions.length === expansionIds.length;

	if (form.text.trim()) parts.push(form.text.trim());
	if (form.expansions.length && !allExpansions) parts.push(`e:${form.expansions.join(',')}`);
	for (const [key, { op, value }] of Object.entries(form.stats)) {
		if (value !== null) parts.push(`${key}${op}${value}`);
	}
	if (form.hitLocations.length) parts.push(`loc:${form.hitLocations.join(',')}`);

	return parts.join(' ');
};
