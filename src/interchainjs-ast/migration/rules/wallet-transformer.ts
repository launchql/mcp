import ts from "typescript";

const cosmjsWalletClass = "DirectSecp256k1HdWallet";
const interchainjsWalletClass = "Secp256k1HDWallet";
const fromMnemonicMethod = "fromMnemonic";

// Basic HD Path - assumes standard Cosmos path for now
// TODO: Potentially parse the mnemonic options if more complex paths are used in CosmJS?
const defaultHdPath = "m/44'/118'/0'/0/0"; // HDPath.cosmos(0, 0, 0).toString()

/**
 * Creates a transformer to convert CosmJS DirectSecp256k1HdWallet.fromMnemonic calls
 * to InterchainJS Secp256k1HDWallet.fromMnemonic calls.
 */
export function createWalletTransformer(): ts.TransformerFactory<ts.SourceFile> {
	return (context) => {
		const visitor: ts.Visitor = (node) => {
			// Look for call expressions
			if (ts.isCallExpression(node)) {
				// Check if it's Class.fromMnemonic()
				if (
					ts.isPropertyAccessExpression(node.expression) &&
					ts.isIdentifier(node.expression.expression) &&
					node.expression.expression.escapedText === cosmjsWalletClass &&
					node.expression.name.escapedText === fromMnemonicMethod &&
					node.arguments.length >= 2
				) {
					const mnemonicArg = node.arguments[0];
					const optionsArg = node.arguments[1];

					// Check if the second argument is an object literal
					if (ts.isObjectLiteralExpression(optionsArg)) {
						// Find the 'prefix' property assignment
						const prefixProperty = optionsArg.properties.find(
							(prop) =>
								ts.isPropertyAssignment(prop) && // Check if it's a property assignment
								ts.isIdentifier(prop.name) && // Check if the name is an identifier
								prop.name.escapedText === "prefix", // Check if the name is 'prefix'
						);

						// Ensure prefixProperty is a PropertyAssignment before accessing initializer
						if (prefixProperty && ts.isPropertyAssignment(prefixProperty)) {
							const prefixValue = prefixProperty.initializer;

							// Construct the new options array for InterchainJS
							const newOptionsArray = ts.factory.createArrayLiteralExpression([
								ts.factory.createObjectLiteralExpression([
									ts.factory.createPropertyAssignment(
										"prefix",
										prefixValue, // Reuse the original prefix value expression
									),
									ts.factory.createPropertyAssignment(
										"hdPath",
										// Use the default path string. Ideally, we'd use HDPath.cosmos().toString(),
										// but that requires importing HDPath and ensuring it's available.
										// For simplicity in transformation, use the string directly.
										ts.factory.createStringLiteral(defaultHdPath),
									),
								]),
							]);

							// Update the call expression
							return ts.factory.updateCallExpression(
								node,
								ts.factory.updatePropertyAccessExpression(
									node.expression as ts.PropertyAccessExpression,
									ts.factory.createIdentifier(interchainjsWalletClass), // Update class name
									(node.expression as ts.PropertyAccessExpression).name, // Keep method name
								),
								node.typeArguments,
								[mnemonicArg, newOptionsArray], // Pass mnemonic and new options array
							);
						}
					}
				}
			}
			return ts.visitEachChild(node, visitor, context);
		};

		return (sourceFile) => ts.visitNode(sourceFile, visitor) as ts.SourceFile;
	};
}
