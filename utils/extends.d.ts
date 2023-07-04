import { CSSProperties } from "../types/css";
export interface StyleReturn<P extends Record<string, unknown>> {
    (props: P): string;
    rules: CSSProperties<P>;
}
export declare const extendsCSS: <P extends Record<string, any>>(target: StyleReturn<P>, source: CSSProperties<P>) => CSSProperties<P>;
