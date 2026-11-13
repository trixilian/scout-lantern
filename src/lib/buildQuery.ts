import type { NumberKey } from './filter';
import { AFFINITY_KEYS, type AffinityKey, type ClauseOp } from './query';
import type { AffinityColor, HitLocation } from './types';

export type AdvancedSearchForm = {
	text: string;
	expansions: string[];
	/** Source ids, e.g. "bm". */
	sources: string[];
	hitLocations: HitLocation[];
	/** The color picked for each edge and the center of the mini card; null when blank. */
	affinities: Record<AffinityKey, AffinityColor | null>;
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
	if (form.sources.length) parts.push(`src:${form.sources.join(',')}`);
	for (const [key, { op, value }] of Object.entries(form.stats)) {
		if (value !== null) parts.push(`${key}${op}${value}`);
	}
	if (form.hitLocations.length) parts.push(`loc:${form.hitLocations.join(',')}`);
	if (form.affinities != null) {
		for (const key of AFFINITY_KEYS) {
			const color = form.affinities[key];
			if (color != null) {
				parts.push(`${key}:${color}`);
			}
		}
	}
	return parts.join(' ');
};
