export interface Card {
	id: string;
	name: string;
	keywords: string[];
	rules_text: string;
}

export interface CardsResponse {
	cards: Card[];
	total: number;
}
