import type { SpecialRule } from './types';

export const formatSpecialRule = (rule: SpecialRule): string => {
	if (rule.name === 'Meal' && typeof rule.value === 'string') {
		return `Meal - ${rule.value}`;
	}
	if (rule.value === undefined) return rule.name;
	return `${rule.name} ${rule.value}`;
};
