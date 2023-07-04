import { HashMap } from "../utils/hashmap";
import { CSSProperties, ComputedStyle, ThemeStyledReturn } from "../types/css";

type StyleMap = HashMap<string, any>

const isPrimitive = (value: unknown): boolean => (
	[ "string", "number" ].includes(typeof value) || 
  (typeof value == "function" && value["isUnit"]) &&
  String(value) != "[object Object]" &&
	!Array.isArray(value)
);

const isFunction = (value: unknown): boolean => (
	typeof value == "function" && 
  !value["isUnit"] && 
  String(value) != "[object Object]"&&
	!Array.isArray(value)
);

const isEmptyObject = (obj: object): boolean => {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const extractStyle = <P extends Record<string, unknown>>
	(obj: CSSProperties<P>): [CSSProperties<P>, CSSProperties<P>, Array<ComputedStyle<P>>] => {
	return Object.entries(obj)
		.filter(([ key ]) => key !== "mixins")
		.reduce(
			(acc, [ key, value ]) => {
				if (isPrimitive(value))
					acc[0][key] = value as string;
				else if (isFunction(value))
					acc[1][key] = value as string;
				else if (key === "computed") acc[2] = [ ...acc[2], ...value as Array<any> ];
				else {
					const [ prim, dyn ] = extractStyle(value as CSSProperties<P>);
					if (!isEmptyObject(prim)) acc[0][key] = prim;
					if (!isEmptyObject(dyn)) acc[1][key] = dyn;
				}
				return acc;
			}, [ {}, {}, []],
		);
};

const regex = /^\s*([\.#>+\[\]:\s\w-]+)/;

export const separateArrays = <P extends Record<string, unknown>>(css: CSSProperties<P>) => {
	return Object.entries(css).reduce(
		(acc, [ key, value ]) => {
			if (isPrimitive(value)) acc[0][key] = value; 
			else {
				if (regex.test(key)) acc[1][key] = value;
				else acc[2][key] = value;
			}
			return acc;
		}, [ {}, {}, {} ]);
};

export const dynamicToPrimitive = <P extends Record<string, unknown>>(css: CSSProperties<P>, props: P & ThemeStyledReturn) => {
	return Object.fromEntries(
		Object.entries(css)
			.map( ([ key, value ]) => { 
				return isPrimitive(value)
					? [ key, value ]
					:	isFunction(value)
						? [ key, (value as (props: P & ThemeStyledReturn) => any)(props) ]
						: [ key, dynamicToPrimitive(value as CSSProperties<P>, props) ];
			},
			),
	);
};
