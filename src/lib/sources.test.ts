import { describe, it, expect } from 'vitest';
import type { Card, Source } from '$lib/types';
import { sourcesByExpansion } from './sources';

// In display order, as in the data (Starting Gear first, Rare Gear last).
const sources: Record<string, Source> = {
	bs: { name: 'Barber Surgeon' },
	bm: { name: 'Bone Smith' },
	k: { name: 'Kingsmith' },
	rg: { name: 'Rare Gear' }
};

const card = (id: string, expansion: string, source?: string): Card => ({
	id,
	name: id,
	expansion,
	...(source && { source })
});

describe('sourcesByExpansion', () => {
	it('lists the source ids each expansion uses', () => {
		const cards = [card('a', 'core', 'bm'), card('b', 'gce', 'k')];
		expect(sourcesByExpansion(cards, sources)).toEqual({ core: ['bm'], gce: ['k'] });
	});

	it('lists each source once per expansion', () => {
		const cards = [card('a', 'core', 'bm'), card('b', 'core', 'bm')];
		expect(sourcesByExpansion(cards, sources)).toEqual({ core: ['bm'] });
	});

	it('orders the sources like `sources`, not by the cards', () => {
		const cards = [card('a', 'core', 'rg'), card('b', 'core', 'bm'), card('c', 'core', 'bs')];
		expect(sourcesByExpansion(cards, sources)).toEqual({ core: ['bs', 'bm', 'rg'] });
	});

	it('lists a source in every expansion that uses it', () => {
		const cards = [card('a', 'core', 'rg'), card('b', 'gce', 'rg')];
		expect(sourcesByExpansion(cards, sources)).toEqual({ core: ['rg'], gce: ['rg'] });
	});

	it('leaves out cards without a source, and expansions with none', () => {
		const cards = [card('a', 'core'), card('b', 'gce', 'k')];
		expect(sourcesByExpansion(cards, sources)).toEqual({ gce: ['k'] });
	});
});
