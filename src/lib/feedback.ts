// A Google Form collects feedback. Opened plainly it is general feedback; with a card id
// filled in (a "pre-filled link") it is feedback on that card.
const FORM_URL =
	'https://docs.google.com/forms/d/e/1FAIpQLSem4qcmA0rZiKf4MWZjRbbjl1mrfP9XGL2dEXbm6kV4yu5SWw/viewform';
/** The form's "Card id" field, as named in the pre-filled link. */
const CARD_ID_FIELD = 'entry.1157867948';

/** Link to the feedback form, with the card id filled in when one is given. */
export function feedbackUrl(cardId?: string): string {
	const url = new URL(FORM_URL);
	if (cardId) {
		url.searchParams.set('usp', 'pp_url');
		url.searchParams.set(CARD_ID_FIELD, cardId);
	}
	return url.href;
}
