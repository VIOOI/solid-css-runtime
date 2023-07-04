export type HashMap<K, V> = ReadonlyArray<[K, V]> | [];

export const hempty = <K, V>(): HashMap<K, V> => [];

// export const hput = <K, V>(key: K, value: V, map: HashMap<K, V>): HashMap<K, V> => 
// 	[ ...map.filter(([ k ]) => k !== key), [ key, value ]];

// export const hget = <K, V>(key: K, map: HashMap<K, V>): V | undefined => 
// 	map.find(([ k ]) => k === key)?.[1];

// export const hremove = <K, V>(key: K, map: HashMap<K, V>): HashMap<K, V> => 
// 	map.filter(([ k ]) => k !== key);

export const hput = <K, V>(map: HashMap<K, V>) => (key: K, value: V): HashMap<K, V> => 
	[ ...map.filter(([ k ]: [ k: any ]) => k !== key), [ key, value ]];

export const hget = <K, V>( map: HashMap<K, V>) => (key: K | number): V | undefined => 
	map.find(([ k ]: [ k: any ]) => k === key)?.[1];

