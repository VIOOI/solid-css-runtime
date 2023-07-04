/* eslint-disable no-useless-escape */
import { find, incrementLink, insert } from "../utils/binaryTree";
import { CSSProperties } from "../types/css";

import { getStringCSS } from "./convert";

import { generateHash, generateSelector } from "./hash";
import { separateArrays } from "./objectUtils";

export const writeStaticStyle = <P extends Record<string, unknown>>(
	hash = "",
	css: CSSProperties<P>,
	sheet: CSSStyleSheet,
	theme: (name: string | number) => string,
	prefix = "",
	writen = true,
) => {
	const [ primitiveRules, mediaRules, selectorRules ] = separateArrays(css);
	hash = hash || `.${generateHash(JSON.stringify(css), prefix)}`;
	if (find(window["SrtClasses"], hash) === null) {
		window["SrtClasses"] = insert(window["SrtClasses"], hash);
		sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);

		Object.entries(selectorRules)
			.forEach(([ key, value ]) => {
				const selector = generateSelector(hash, key);
				writeStaticStyle(selector, value as CSSProperties<Record<string, unknown>>, sheet, theme, "", writen);
			});

		Object.entries(mediaRules).forEach(([ media, value ]) => {
			writeMediaStyle(
				hash,
				value as CSSProperties<Record<string, unknown>>,
				Array.from(sheet.cssRules)
					.find(n => n["conditionText"] == theme(media)) as CSSMediaRule,
				media,
			);
		});
	}
	else if (writen) window["SrtClasses"] = incrementLink(window["SrtClasses"], hash);




	return hash.slice(1);
};

export const writeMediaStyle = <P extends Record<string, unknown>>(
	hash: string, css: CSSProperties<P>, sheet: CSSMediaRule, media: string,
) => {
	const [ primitiveRules, _, selectorRules ] = separateArrays(css);
	sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);

	const mediaIndex = Array.from(sheet.cssRules)
		.findIndex((n: CSSRule) => n["selectorText"] == hash);

	if (mediaIndex >= 0) sheet.deleteRule(mediaIndex);
	sheet.insertRule(`${hash} { ${getStringCSS(primitiveRules)} }`);

	Object.entries(selectorRules)
		.forEach(([ key, value ]) => {
			const selector = generateSelector(hash, key);
			if (find(window["SrtClasses"], selector) === null) {
				window["SrtClasses"] = insert(window["SrtClasses"], selector);
				 writeMediaStyle(generateSelector(hash, key), value as CSSProperties<Record<string, unknown>>, sheet, media);
				console.log(selector);
			}
		});
		

};
