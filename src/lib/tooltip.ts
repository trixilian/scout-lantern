import Tooltip from 'bootstrap/js/dist/tooltip';
import type { Attachment } from 'svelte/attachments';

/**
 * Shows `title` in a Bootstrap tooltip on hover and on focus (Tab, or a tap on touch
 * screens). Use on a focusable element: `<button {@attach tooltip(text)}>`.
 *
 * The Bootstrap tooltip is only created the first time the element is hovered or focused,
 * so a page full of cards doesn't build hundreds of tooltips up front. From then on
 * Bootstrap's own hover and focus handling takes over.
 * The tooltip is removed when the element goes away or `title` changes.
 */
export function tooltip(title: string): Attachment<HTMLElement> {
	return (element) => {
		let instance: Tooltip | undefined;

		const create = () => {
			stopWaiting();
			instance = new Tooltip(element, { title, trigger: 'hover focus' });
			// The hover or focus that triggered this already happened, so show it now.
			instance.show();
		};
		const stopWaiting = () => {
			element.removeEventListener('pointerenter', create);
			element.removeEventListener('focusin', create);
		};

		element.addEventListener('pointerenter', create);
		element.addEventListener('focusin', create);

		return () => {
			stopWaiting();
			instance?.dispose();
		};
	};
}
