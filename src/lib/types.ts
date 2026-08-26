/**
 * Shapes returned by the card API.
 * Mirrors kdm-search/docs/api-contract.md — response `version` 1.
 */

/** A gear-card combat stat: a number, or "*" for a special/variable value. */
export type Stat = number | '*' | null;

/** Affinity edge colour. The contract enumerates exactly these three. */
export type AffinityColor = 'red' | 'green' | 'blue';

/** The four card edges. Each carries a colour, or null when that edge is blank. */
export interface Affinities {
	top: AffinityColor | null;
	right: AffinityColor | null;
	bottom: AffinityColor | null;
	left: AffinityColor | null;
}

export interface Card {
	// Always present, never null.
	id: string;
	name: string;
	keywords: string[];
	rules_text: string;

	// Null / empty when they don't apply to a card.
	/** Location or crafter that provides the card. */
	source: string | null;
	/** Armor points on armor cards. */
	armor_value: number | null;
	/** Locations this card's armor protects — usually one, occasionally more. */
	hit_location: string[];
	speed: Stat;
	accuracy: Stat;
	strength: Stat;
	special_rules: string[];
	affinities: Affinities;
}

export interface CardsResponse {
	cards: Card[];
	/** Number of cards in `cards`. Reserved for total-before-pagination later. */
	total: number;
	/** Schema version of the response. Bumped on breaking shape changes. */
	version: number;
}
