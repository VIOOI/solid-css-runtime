export type Tree<T> = {
    value: T;
    countLinks: number;
    left: Tree<T> | null;
    right: Tree<T> | null;
};
export declare function createNode<T>(value: T, left?: Tree<T> | null, right?: Tree<T> | null): Tree<T>;
export declare function insert<T>(tree: Tree<T> | null, value: T): Tree<T>;
export declare function find<T>(tree: Tree<T> | null, value: T): Tree<T> | null;
export declare function getLinkCount<T>(tree: Tree<T> | null, value: T): number;
export declare function incrementLink<T>(tree: Tree<T> | null, value: T): Tree<T> | null;
export declare function decrementLink<T>(tree: Tree<T> | null, value: T): Tree<T> | null;
export declare function remove<T>(tree: Tree<T> | null, value: T): Tree<T> | null;
