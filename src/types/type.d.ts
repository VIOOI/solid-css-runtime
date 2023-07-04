import { Tree } from "../../utils/binaryTree";

declare global {
	interface Window {
		SrtClasses: Tree<string>,
	}
}

export {};
