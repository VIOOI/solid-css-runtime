export const getStringCSS = (css: Record<string, unknown>) => 
	Object.entries(css)
		.map(([ key, value ]) =>
		 `${
			 String(key)
			 .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			 .toLowerCase()
		 }:${value};`)
		.join(" ");
