export const generateHash = (str: string, prefix = ""): string => {
	const sum = [ ...str ]
		.reduce((sum, char) => sum + Math.sqrt(char.charCodeAt(0)), 0);
	return `${prefix != "" ? prefix : "s"}${sum.toString(32).slice(-6).toUpperCase()}`;
};

export const generateSelector = (className: string, selector: string): string => {
	return selector === "" ? className : selector.replace("&", className);
};

