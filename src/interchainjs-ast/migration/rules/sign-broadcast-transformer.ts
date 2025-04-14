import ts from "typescript";

const signBroadcastMethod = "signAndBroadcast";
const signingClientVarName = "signingClient"; // Assume client variable is named this

// Placeholder for the fee object
const feePlaceholderComment =
	" /* TODO: Replace with InterchainJS fee object (e.g., { amount: [{ denom, amount }], gas }) */ ";
const feePlaceholderExpression = ts.factory.createIdentifier(
	`fee${feePlaceholderComment}`,
);

/**
 * Creates a transformer to adjust the signAndBroadcast calls:
 * - Removes the Any wrapper { typeUrl, value } from messages.
 * - Replaces the fee argument with a placeholder comment.
 */
export function createSignBroadcastTransformer(): ts.TransformerFactory<ts.SourceFile> {
	return (context) => {
		const visitor: ts.Visitor = (node) => {
			// Look for call expressions
			if (ts.isCallExpression(node)) {
				// Check if it's signingClient.signAndBroadcast()
				if (
					ts.isPropertyAccessExpression(node.expression) &&
					ts.isIdentifier(node.expression.expression) &&
					node.expression.expression.escapedText === signingClientVarName &&
					node.expression.name.escapedText === signBroadcastMethod &&
					node.arguments.length >= 3 // sender, messages, fee, [memo]
				) {
					const senderArg = node.arguments[0];
					const messagesArg = node.arguments[1];
					const memoArg = node.arguments[3]; // Optional

					let newMessagesArg = messagesArg; // Default to original

					// Check if messages argument is an array literal
					if (ts.isArrayLiteralExpression(messagesArg)) {
						const newElements = messagesArg.elements.map((element) => {
							// Check if element is { typeUrl: ..., value: ... }
							if (ts.isObjectLiteralExpression(element)) {
								const typeUrlProp = element.properties.find(
									(prop) =>
										ts.isPropertyAssignment(prop) &&
										ts.isIdentifier(prop.name) &&
										prop.name.escapedText === "typeUrl",
								);
								const valueProp = element.properties.find(
									(prop) =>
										ts.isPropertyAssignment(prop) &&
										ts.isIdentifier(prop.name) &&
										prop.name.escapedText === "value",
								);

								if (
									typeUrlProp &&
									valueProp &&
									ts.isPropertyAssignment(valueProp)
								) {
									return valueProp.initializer;
								}
							}
							return element;
						});
						// Pass true for multiline formatting
						newMessagesArg = ts.factory.createArrayLiteralExpression(
							newElements,
							true,
						);
					}

					const newArgs = [senderArg, newMessagesArg, feePlaceholderExpression];
					if (memoArg) {
						newArgs.push(memoArg);
					}

					// Update the call expression
					return ts.factory.updateCallExpression(
						node,
						node.expression,
						node.typeArguments,
						newArgs,
					);
				}
			}
			return ts.visitEachChild(node, visitor, context);
		};

		return (sourceFile) => ts.visitNode(sourceFile, visitor) as ts.SourceFile;
	};
}
