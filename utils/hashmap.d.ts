export type HashMap<K, V> = ReadonlyArray<[K, V]> | [];
export declare const hempty: <K, V>() => HashMap<K, V>;
export declare const hput: <K, V>(map: HashMap<K, V>) => (key: K, value: V) => HashMap<K, V>;
export declare const hget: <K, V>(map: HashMap<K, V>) => (key: number | K) => V;
