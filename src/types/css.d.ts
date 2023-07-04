export type CssValue<P> =  number | ((props: P) => unknown);
type Cssempty = `${number}${"vw"|"vh"|"px"|"rem"|"rem"|"%"}` | `$${string}`;
export type ComputedStyleCore<P extends Record<string, unknown>, T extends CSSProperties<P & ThemeStyledReturn>> = (props: P) => T;
export type ComputedStyle<P extends Record<string, unknown>> = ComputedStyleCore<P, CSSProperties<P & ThemeStyledReturn>>;

export type CSSProperties<P extends Record<string, unknown>> = {
	computed?: Array<ComputedStyle<P>>,
	mixins?: Array<CSSProperties<P & ThemeStyledReturn>>,

  display?: "block" | "none" | "flex" | "inline" | "inline-block" | "grid" | CssValue<P>,
  position?: "absolute" | "fixed" | "relative" | "static" | "sticky" | CssValue<P>,
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse" | CssValue<P>,
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | CssValue<P>,
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline" | CssValue<P>,
  textAlign?: "left" | "right" | "center" | "justify" | CssValue<P>,
  cursor?: "auto" | "default" | "pointer" | "text" | "wait" | "help" | "progress" | CssValue<P>,
  visibility?: "visible" | "hidden" | "collapse" | CssValue<P>,
  whiteSpace?: "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line" | CssValue<P>,
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse" | CssValue<P>,
  boxSizing?: "content-box" | "border-box" | CssValue<P>,
  overflowX?: "visible" | "hidden" | "scroll" | "auto" | CssValue<P>,
  overflowY?: "visible" | "hidden" | "scroll" | "auto" | CssValue<P>,
  userSelect?: "auto" | "none" | "text" | "contain" | CssValue<P>,
  pointerEvents?: "auto" | "none" | "visiblePainted" | "visibleFill" | "visibleStroke" | "all" | CssValue<P>,
  backgroundSize?: "auto" | "cover" | "contain" | CssValue<P>,
  backgroundRepeat?: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" | CssValue<P>,
  height?: Cssempty | CssValue<P>,
  width?: Cssempty | CssValue<P>,
  top?: Cssempty | CssValue<P>,
  bottom?: Cssempty | CssValue<P>,
  left?: Cssempty | CssValue<P>,
  right?: Cssempty | CssValue<P>,
  padding?: Cssempty | CssValue<P>,
  paddingTop?: Cssempty | CssValue<P>,
  paddingRight?: Cssempty | CssValue<P>,
  paddingBottom?: Cssempty | CssValue<P>,
  paddingLeft?: Cssempty | CssValue<P>,
  margin?: Cssempty | CssValue<P>,
  marginTop?: Cssempty | CssValue<P>,
  marginRight?: Cssempty | CssValue<P>,
  marginBottom?: Cssempty | CssValue<P>,
  marginLeft?: Cssempty | CssValue<P>,
  border?: string | CssValue<P>,
  borderTop?: string | CssValue<P>,
  borderRight?: string | CssValue<P>,
  borderBottom?: string | CssValue<P>,
  borderLeft?: string | CssValue<P>,
  borderRadius?: string | CssValue<P>,
  backgroundColor?: string | CssValue<P>,
  background?: string | CssValue<P>,
  color?: string | CssValue<P>,
  fontFamily?: string | CssValue<P>,
  fontSize?: string | CssValue<P>,
  fontWeight?:  number | CssValue<P>,
  letterSpacing?: string | CssValue<P>,
  lineHeight?: string | CssValue<P>,
  textDecoration?: string | CssValue<P>,
  overflow?: string | CssValue<P>,
  boxShadow?: string | CssValue<P>,
  zIndex?: string | CssValue<P>,
  opacity?: number | CssValue<P>,
  transform?: string | CssValue<P>,
  transition?: string | CssValue<P>,
  animation?: string | CssValue<P>,
  backgroundImage?: string | CssValue<P>,
  backgroundPosition?: string | CssValue<P>,
  outline?: string | CssValue<P>,
  outlineColor?: string | CssValue<P>,
  outlineStyle?: string | CssValue<P>,
  outlineWidth?: string | CssValue<P>,
  transformOrigin?: string | CssValue<P>,
  transitionProperty?: string | CssValue<P>,
  transitionDuration?: string | CssValue<P>,
  transitionTimingFunction?: string | CssValue<P>,
  transitionDelay?: string | CssValue<P>,
  filter?: string | CssValue<P>,
  backdropFilter?: string | CssValue<P>,

	[propName: string]: 
		string 
		| CSSProperties<P & ThemeStyledReturn> 
		| CssValue<P> 
		| Array<ComputedStyle<P>>
		| Array<CSSProperties<P & ThemeStyledReturn>>
		;
} 
// export type CSSProperties<P extends Record<string, unknown>> = CSSPropertie<P> & Record<string, CSSPropertie<P>>

export type ThemeStyled = {
	colors?: Record<string, unknown>,
	space?: Record<string, unknown>,
	fontSizes?: Record<string, unknown>,
	fonts?: Record<string, unknown>,
	fontWeights?: Record<string, unknown>,
	lineHeights?: Record<string, unknown>,
	letterSpacings?: Record<string, unknown>,
	sizes?: Record<string, unknown>,
	borderWidths?: Record<string, unknown>,
	borderStyles?: Record<string, unknown>,
	radii?: Record<string, unknown>,
	shadows?: Record<string, unknown>,
	zIndices?: Record<string, unknown>,
	transitions?: Record<string, unknown>,
	media?: Record<string, string>,
}

type ThemeStyledReturn = {
	[K in keyof ThemeStyled]: (name: string | number) => string;
}

