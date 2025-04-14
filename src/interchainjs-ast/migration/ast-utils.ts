import ts from "typescript";

/**
 * Parses a string of TypeScript code into an AST SourceFile.
 */
export function parseCode(code: string): ts.SourceFile {
	return ts.createSourceFile(
		"migration-temp.ts", // Temporary file name, doesn't need to exist
		code,
		ts.ScriptTarget.Latest,
		true, // setParentNodes
		ts.ScriptKind.TS,
	);
}

/**
 * Prints an AST Node back into a string format.
 */
export function printNode(node: ts.Node, sourceFile: ts.SourceFile): string {
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

/**
 * Prints a SourceFile AST back into a string format.
 */
export function printSourceFile(sourceFile: ts.SourceFile): string {
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	return printer.printFile(sourceFile);
}

/**
 * Applies a series of transformer factories to an AST SourceFile.
 */
export function applyTransformers(
	sourceFile: ts.SourceFile,
	transformers: ts.TransformerFactory<ts.SourceFile>[],
): ts.SourceFile {
	const result = ts.transform(sourceFile, transformers);
	// Assuming the transformation results in a single SourceFile
	return result.transformed[0];
}
