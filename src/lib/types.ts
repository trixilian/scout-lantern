/**
 * Shape of static/data/cards.json.
 * Format `version` 3 (see DATA_VERSION below).
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
	/** Expansion id, e.g. "core". */
	expansion: string;

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
	/** Colour of the large bonus affinity square in the middle of the card. */
	center_affinity?: AffinityColor;
}

/** Card data format version this frontend is written against. */
export const DATA_VERSION = 3;

export interface CardData {
	/** Format version. Bumped on breaking shape changes. */
	version: number;
	/** ISO 8601 timestamp of the export. */
	generated: string;
	cards: Card[];
}
