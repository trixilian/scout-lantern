/**
 * Shapes returned by the card API.
 * Mirrors kdm-search/docs/api-contract.md — response `version` 2.
 *
 * Fields that don't apply to a card are left out of the JSON (never null), so they are
 * optional (`?`) here and read as `undefined`.
 */

/** A gear-card combat stat: a number, or "*" for a special/variable value. */
export type Stat = number | '*';

/** Affinity edge colour. The contract enumerates exactly these three. */
export type AffinityColor = 'red' | 'green' | 'blue';

/** Affinity symbol in the affinity boxes */
export type AffinitySymbol =
	'red-square' | 'green-square' | 'blue-square' | 'red-puzzle' | 'green-puzzle' | 'blue-puzzle';

/** Body location an armor card protects. */
export type HitLocation = 'head' | 'arms' | 'chest' | 'waist' | 'legs';

/** The four card edges. Only edges with a colour are present. */
export interface AffinityBox {
	affinities: AffinitySymbol[];
	effect: string;
}

/** The four card edges. Only edges with a colour are present. */
export interface Affinities {
	top?: AffinityColor;
	right?: AffinityColor;
	bottom?: AffinityColor;
	left?: AffinityColor;
}

/** A weapon's combat stats. A stat missing from the card data is left out. */
export interface WeaponStats {
	speed?: Stat;
	accuracy?: Stat;
	strength?: Stat;
}

export interface Card {
	// Always present.
	id: string;
	name: string;

	// Left out when they don't apply to a card.
	keywords?: string[];
	rules_text?: string;
	/** Location or crafter that provides the card. */
	source?: string;
	/** Armor points on armor cards. */
	armor_value?: number;
	/** Locations this card's armor protects — usually one, occasionally more. */
	hit_location?: HitLocation[];
	/** Speed, accuracy and strength on weapon cards. */
	weapon_stats?: WeaponStats;
	special_rules?: string[];
	/** Card edges with a colour. Absent when every edge is blank. */
	affinities?: Affinities;
	/** Affinity boxes in the symbol: effect style */
	affinity_boxes?: AffinityBox[];
}

export interface CardsResponse {
	cards: Card[];
	/** Number of cards in `cards`. Reserved for total-before-pagination later. */
	total: number;
	/** Schema version of the response. Bumped on breaking shape changes. */
	version: number;
}
