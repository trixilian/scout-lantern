import Tooltip from 'bootstrap/js/dist/tooltip';
import type { Attachment } from 'svelte/attachments';

/**
 * Shows `title` in a Bootstrap tooltip on hover and on focus (Tab, or a tap on touch
 * screens). Use on a focusable element: `<button {@attach tooltip(text)}>`.
 * The tooltip is removed when the element goes away or `title` changes.
 */
export function tooltip(title: string): Attachment<HTMLElement> {
	return (element) => {
		const instance = new Tooltip(element, { title, trigger: 'hover focus' });
		return () => instance.dispose();
	};
}
