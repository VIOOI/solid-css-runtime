import { CSSProperties, ThemeStyled, ThemeStyledReturn } from "./types/css";
export declare const generateTheme: (theme: ThemeStyled) => <P extends Record<string, unknown>>(prefix: string, css: CSSProperties<P & ThemeStyledReturn>) => StyleHookReturn<P>;
export interface StyleHookReturn<P extends Record<string, unknown>> {
    (props: P): () => string;
    rules: CSSProperties<P>;
}
