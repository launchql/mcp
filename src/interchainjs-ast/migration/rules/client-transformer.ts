import ts from "typescript";

const cosmjsClientClass = "SigningStargateClient";
const interchainjsClientClass = "SigningClient";
const connectMethod = "connectWithSigner";

/**
 * Creates a transformer to convert CosmJS SigningStargateClient.connectWithSigner calls
 * to InterchainJS SigningClient.connectWithSigner calls, adding default options.
 */
export function createClientTransformer(): ts.TransformerFactory<ts.SourceFile> {
	return (context) => {
		const visitor: ts.Visitor = (node) => {
			// Look for call expressions
			if (ts.isCallExpression(node)) {
				// Check if it's Class.connectWithSigner()
				if (
					ts.isPropertyAccessExpression(node.expression) &&
					ts.isIdentifier(node.expression.expression) &&
					node.expression.expression.escapedText === cosmjsClientClass &&
					node.expression.name.escapedText === connectMethod &&
					node.arguments.length === 2 // Expect rpcEndpoint and signer
				) {
					const rpcArg = node.arguments[0];
					const signerArg = node.arguments[1];

					// Construct the default options object for InterchainJS
					const defaultOptions = ts.factory.createObjectLiteralExpression(
						[
							ts.factory.createPropertyAssignment(
								"broadcast",
								ts.factory.createObjectLiteralExpression([
									ts.factory.createPropertyAssignment(
										"checkTx",
										ts.factory.createTrue(),
									),
									ts.factory.createPropertyAssignment(
										"deliverTx",
										ts.factory.createTrue(),
									),
								]),
							),
						],
						true, // multiline
					);

					// Update the call expression
					return ts.factory.updateCallExpression(
						node,
						ts.factory.updatePropertyAccessExpression(
							node.expression as ts.PropertyAccessExpression,
							ts.factory.createIdentifier(interchainjsClientClass), // Update class name
							(node.expression as ts.PropertyAccessExpression).name, // Keep method name
						),
						node.typeArguments,
						[rpcArg, signerArg, defaultOptions], // Add the options object
					);
				}
			}
			return ts.visitEachChild(node, visitor, context);
		};

		return (sourceFile) => ts.visitNode(sourceFile, visitor) as ts.SourceFile;
	};
}
