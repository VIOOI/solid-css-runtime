import { CSSProperties } from "../types/css";

export interface StyleReturn<P extends Record<string, unknown>> {
    (props: P): string;
    rules: CSSProperties<P>;
}

export const extendsCSS = <P extends Record<string, any>>
	(target: StyleReturn<P>, source: CSSProperties<P>): CSSProperties<P> =>
		Object.assign({}, target.rules, source);
