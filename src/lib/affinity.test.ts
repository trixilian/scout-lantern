import { describe, it, expect } from 'vitest';
import { nextAffinityColor } from './affinity';

describe('nextAffinityColor', () => {
	it('cycles blank, red, green, blue', () => {
		expect(nextAffinityColor(null)).toBe('red');
		expect(nextAffinityColor('red')).toBe('green');
		expect(nextAffinityColor('green')).toBe('blue');
	});

	it('goes back to blank after blue', () => {
		expect(nextAffinityColor('blue')).toBeNull();
	});
});
