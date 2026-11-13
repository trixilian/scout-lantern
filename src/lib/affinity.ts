import type { AffinityColor } from './types';

/**
 * The next color when a spot of the affinity picker is clicked: blank (null), red, green,
 * blue, then blank again.
 */
export const nextAffinityColor = (color: AffinityColor | null): AffinityColor | null => {
	switch (color) {
		case null:
			return 'red';
		case 'red':
			return 'green';
		case 'green':
			return 'blue';
		case 'blue':
			return null;
	}
};
