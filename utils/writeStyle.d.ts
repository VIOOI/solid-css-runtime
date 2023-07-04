import { CSSProperties } from "../types/css";
export declare const writeStaticStyle: <P extends Record<string, unknown>>(hash: string, css: CSSProperties<P>, sheet: CSSStyleSheet, theme: (name: string | number) => string, prefix?: string, writen?: boolean) => string;
export declare const writeMediaStyle: <P extends Record<string, unknown>>(hash: string, css: CSSProperties<P>, sheet: CSSMediaRule, media: string) => void;
