import { decrementLink, getLinkCount, remove } from "../utils/binaryTree";

export const createTag = (): HTMLStyleElement => {
	const tag = document.createElement("style") as HTMLStyleElement;
	tag.setAttribute("id", "srt_style");
	document.head.appendChild(tag);
	return tag;
};

export const createMediaStyle = (media: string): HTMLStyleElement => {
	let styleSheet = document.head.querySelector("style#srt_style") as HTMLStyleElement;
	if(styleSheet == null) styleSheet = createTag();
	const mst = styleSheet.sheet.insertRule(`@media ${media} {}`, styleSheet.sheet.cssRules.length);

	return styleSheet;
};

export const deleteStyles = (hash: string, sheet: CSSStyleSheet) => {
	const count = getLinkCount(window["SrtClasses"], hash);
	if (count == 1) {
		window["SrtClasses"] = remove(window["SrtClasses"], hash);
		getIndexes(Array.from(sheet.cssRules), (e) => e.cssText.includes(hash))
			.forEach(index => sheet.deleteRule(index));
		Array.from(sheet.cssRules).filter(r => r.type == 4)
			.forEach( (media) => {
				getIndexes(Array.from((media as unknown as CSSStyleSheet).cssRules), (e) => e.cssText.includes(hash))
					.forEach(index => sheet.deleteRule(index));
			});
	}
	else window["SrtClass"] = decrementLink(window["SrtClasses"], hash);
};

function getIndexes<T>(array: T[], testFunction: (element: T) => boolean): number[] {
	return array.reduce((accumulator: number[], element: T, index: number) => 
		testFunction(element) ? [ ...accumulator, index ] : accumulator
	, []);
}

