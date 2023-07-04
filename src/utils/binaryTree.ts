export type Tree<T> = {
  value: T;
  countLinks: number;
  left: Tree<T> | null;
  right: Tree<T> | null;
};

export function createNode<T>(value: T, left: Tree<T> | null = null, right: Tree<T> | null = null): Tree<T> {
	return { value, countLinks: 1, left, right };
}

export function insert<T>(tree: Tree<T> | null, value: T): Tree<T> {
	if (tree === null) return createNode(value);
	if (value === tree.value) return { ...tree, countLinks: tree.countLinks + 1 };
	else if (value < tree.value) return { ...tree, left: insert(tree.left, value) };
	else return { ...tree, right: insert(tree.right, value) };
}

export function find<T>(tree: Tree<T> | null, value: T): Tree<T> | null {
	if (tree === null) return null;
	if (tree.value === value) return tree;
	if (value < tree.value) return find(tree.left, value);
	else return find(tree.right, value);
}

export function getLinkCount<T>(tree: Tree<T> | null, value: T): number {
	const node = find(tree, value);
	return node ? node.countLinks : 0;
}

export function incrementLink<T>(tree: Tree<T> | null, value: T): Tree<T> | null {
	if (tree === null) return null;
	if (value === tree.value) return { ...tree, countLinks: tree.countLinks + 1 };
	if (value < tree.value) return { ...tree, left: incrementLink(tree.left, value) };
	else return { ...tree, right: incrementLink(tree.right, value) };
}

export function decrementLink<T>(tree: Tree<T> | null, value: T): Tree<T> | null {
	if (tree === null) return null;
	if (value === tree.value) return tree.countLinks > 1 ? { ...tree, countLinks: tree.countLinks - 1 } : null;
	if (value < tree.value) return { ...tree, left: decrementLink(tree.left, value) };
	else return { ...tree, right: decrementLink(tree.right, value) };
}

function minValueNode<T>(node: Tree<T>): Tree<T> {
	let current = node;
	while (current.left !== null) {
		current = current.left;
	}
	return current;
}

export function remove<T>(tree: Tree<T> | null, value: T): Tree<T> | null {
	if (tree === null) return tree;
	if (value < tree.value) tree.left = remove(tree.left, value);
	else if (value > tree.value) tree.right = remove(tree.right, value);
	else {
		if (tree.left === null) return tree.right;
		else if (tree.right === null) return tree.left;
		tree.value = minValueNode(tree.right).value;
		tree.right = remove(tree.right, tree.value);
	}

	return tree;
}

