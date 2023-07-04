import { CSSProperties, ComputedStyle, ThemeStyledReturn } from "../types/css";
export declare const extractStyle: <P extends Record<string, unknown>>(obj: CSSProperties<P>) => [CSSProperties<P>, CSSProperties<P>, ComputedStyle<P>[]];
export declare const separateArrays: <P extends Record<string, unknown>>(css: CSSProperties<P>) => {}[];
export declare const dynamicToPrimitive: <P extends Record<string, unknown>>(css: CSSProperties<P>, props: P & ThemeStyledReturn) => any;
