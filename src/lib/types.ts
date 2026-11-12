/**
 * Shape of static/data/cards.json.
 * Format `version` 5 (see DATA_VERSION below).
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

export const HIT_LOCATIONS = ['head', 'arms', 'chest', 'waist', 'legs'] as const;

/** Body location an armor card protects. */
export type HitLocation = (typeof HIT_LOCATIONS)[number];

/** Product categories of the expansions. */
export const CATEGORIES = [
	'core-game',
	'large-expansion',
	'monster-expansion',
	'white-box',
	'promotion'
] as const;

export type Category = (typeof CATEGORIES)[number];

/** An expansion's display name and product category. */
export interface Expansion {
	/** E.g. "Core Game". */
	name: string;
	category: Category;
}

/** An affinity bonus box: the affinities it needs and the bonus it gives. */
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

/** A special rule of the card, e.g. "Reach 2" as `{ name: 'Reach', value: 2 }`. */
export interface SpecialRule {
	name: string;
	/** A number (2 in "Reach 2") or text ("1d10" in "Barbed 1d10", "Phoenix" in "Meal - Phoenix"). Absent for rules without one, e.g. "Frail". */
	value?: string | number;
}

export interface Card {
	// Always present.
	id: string;
	name: string;
	/** Expansion id, e.g. "core": a key of `CardData.expansions`. */
	expansion: string;

	// Left out when they don't apply to a card.
	keywords?: string[];
	rules_text?: string;
	/** Location or crafter that provides the card. */
	source?: string;
	/** Armor points on armor cards. */
	armor_value?: number;
	/** Locations this card's armor protects. Usually one, occasionally more. */
	hit_location?: HitLocation[];
	/** Speed, accuracy and strength on weapon cards. */
	weapon_stats?: WeaponStats;
	/** Drawn as the card's special-rules line; not repeated in `rules_text`. */
	special_rules?: SpecialRule[];
	/** Card edges with a colour. Absent when every edge is blank. */
	affinities?: Affinities;
	/** Affinity boxes in the symbol: effect style */
	affinity_boxes?: AffinityBox[];
	/** Colour of the large bonus affinity square in the middle of the card. */
	center_affinity?: AffinityColor;
}

/** One Living Glossary entry. */
export interface GlossaryTerm {
	/** Title as in the glossary, e.g. "Reach X". */
	title: string;
	/** The definition, with the card-text symbol markup, e.g. `(a)`. */
	text: string;
	/** Date the entry was last changed, `YYYY-MM-DD`. */
	updated: string;
}

/**
 * Living Glossary definitions of the gear terms. The text is copyrighted: show `source`,
 * `url` and `copyright` as credit wherever a definition is shown.
 */
export interface Glossary {
	source: string;
	url: string;
	copyright: string;
	/** Date the glossary was downloaded, `YYYY-MM-DD`. */
	retrieved: string;
	/**
	 * Key: the lowercase rule name without its value, so `rule.name.toLowerCase()` finds it
	 * ("Reach" finds "reach"). Not every term has an entry: a lookup can be `undefined`.
	 */
	terms: Record<string, GlossaryTerm>;
}

/** Card data format version this frontend is written against. */
export const DATA_VERSION = 5;

export interface CardData {
	/** Format version. Bumped on breaking shape changes. */
	version: number;
	/** ISO 8601 timestamp of the export. */
	generated: string;
	/** Every expansion id the cards use, in display order (Core Game first). */
	expansions: Record<string, Expansion>;
	cards: Card[];
	/** Definitions for the terms on the cards, with the credit. */
	glossary: Glossary;
}
