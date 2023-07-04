/* eslint-disable @typescript-eslint/no-unused-vars */
import { createEffect, createSignal, onCleanup } from "solid-js";

import { hempty, hget, hput } from "./utils/hashmap";

import { createNode } from "./utils/binaryTree";

import { CSSProperties, ThemeStyled, ThemeStyledReturn } from "./types/css";
import { createMediaStyle, createTag, deleteStyles } from "./utils/styleTags";
import { dynamicToPrimitive, extractStyle } from "./utils/objectUtils";
import { writeStaticStyle } from "./utils/writeStyle";

export const generateTheme = (theme: ThemeStyled) => {
	const sheet: CSSStyleSheet = createTag().sheet;
	window["SrtClasses"] = createNode("");
	const ntheme = Object.fromEntries(Object.entries(theme as Record<string, unknown>)
		.map(([ key, value ]) => {
			let hashTheme = hempty<string, unknown>();
			if (key === "media") { 
				Object.entries(value)
					.forEach(([ , value ]) => {
						createMediaStyle(value);
						hashTheme = hput(hashTheme)(key, value);
					});
			}
			Object.entries(value)
				.forEach(([ key, value ]) => (hashTheme = hput(hashTheme)(key, value)));

			return [ key, hget(hashTheme) ];
		}));
	return createCSS(ntheme, sheet);
};

export interface StyleHookReturn<P extends Record<string, unknown>> {
    (props: P): () => string;
    rules: CSSProperties<P>;
}

const createCSS = (theme: ThemeStyledReturn, sheet: CSSStyleSheet) => 
	<P extends Record<string, unknown>>
	(prefix: string, css: CSSProperties<P & ThemeStyledReturn>): StyleHookReturn<P> => {
		if (css.mixins) 
			css = css.mixins.reduce((acc, mix) => Object.assign({}, acc, mix), css);
	
		const [ primitive, dynamic, computed ] = extractStyle(css);
		const hash = writeStaticStyle("", primitive, sheet, theme.media, `${prefix == "" ? "" : prefix + "-"}s`);
		const hook = (props: P) => {
			const history: Set<string> = new Set();
			const [ dynamicHash, setDynamicHash ] = createSignal("");
			const [ isWriten, setIsWriten ] = createSignal(true);
			createEffect(() => {
				// console.log( computed.reduce((acc, func) => Object.assign(acc, func(props)), {}) );
				setDynamicHash(
					writeStaticStyle(
						"",
						dynamicToPrimitive(
							computed.length > 0
								? Object.assign({}, dynamic, computed.reduce((acc, func) => Object.assign(acc, func(props)), {}))
								: dynamic,
							Object.assign({}, props, theme),
						),
						sheet,
						theme.media,
						`${prefix == "" ? "" : prefix + "-"}d`,
						isWriten(),
					),
				);
				setIsWriten(false);
				history.add(dynamicHash());
			});
			onCleanup(() => {
				deleteStyles(`.${hash}`, sheet);
				Array.from(history).forEach(h => deleteStyles(`.${h}`, sheet));
			});
			return () => `${hash} ${dynamicHash()}`;
			// const className = () => `${hash} ${dynamicHash()}`;
			// className.toString = className; 
			// return className as unknown as string;
		};
		hook.rules = css;
		return hook;
	};
