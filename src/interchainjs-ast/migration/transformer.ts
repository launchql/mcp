import type ts from "typescript";
import { applyTransformers, parseCode, printSourceFile } from "./ast-utils.js";
import { createClientTransformer } from "./rules/client-transformer.js";
import { createImportTransformer } from "./rules/import-transformer.js";
import { createSignBroadcastTransformer } from "./rules/sign-broadcast-transformer.js";
import { createWalletTransformer } from "./rules/wallet-transformer.js";

/**
 * Applies all defined migration transformers to the input code string.
 *
 * @param code The TypeScript code string to transform.
 * @returns The transformed code string.
 */
export function transformCosmjsToInterchainjs(code: string): string {
	// 1. Parse the code into an AST
	const sourceFile = parseCode(code);

	// 2. Define the sequence of transformers to apply
	// Order can matter. Apply imports first, then specific logic.
	const transformers: ts.TransformerFactory<ts.SourceFile>[] = [
		createImportTransformer(),
		createWalletTransformer(),
		createClientTransformer(),
		createSignBroadcastTransformer(),
		// Add other transformers like createFunctionCallTransformer(), etc.
	];

	// 3. Apply the transformers to the AST
	const transformedSourceFile = applyTransformers(sourceFile, transformers);

	// 4. Print the transformed AST back to a string
	const transformedCode = printSourceFile(transformedSourceFile);

	return transformedCode;
}
