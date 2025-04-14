import ts from "typescript";

// Mapping of cosmjs packages to their primary interchainjs equivalents
const packageMap: Record<string, string | null> = {
  "@cosmjs/amino": "@interchainjs/amino",
  "@cosmjs/crypto": "@interchainjs/crypto",
  "@cosmjs/encoding": "@interchainjs/encoding",
  "@cosmjs/math": "@interchainjs/math",
  "@cosmjs/proto-signing": null, // Handled by specific import mappings
  "@cosmjs/stargate": null, // Handled by specific import mappings
  "@cosmjs/utils": "@interchainjs/utils", // Base mapping, specific functions handled below
  "cosmjs-types": "@interchainjs/cosmos-types", // Base mapping for types
};

// Detailed mapping for specific named imports
// Key: Original CosmJS package path
// Value: Record<OriginalImportName, NewPackagePath | { path: NewPackagePath, name: NewImportName } | null>
// - string: New package path (name stays the same)
// - object: New package path and new import name
// - null: Import should be removed (handled by other transformers or deprecated)
const specificImportMap: Record<
  string,
  Record<
    string,
    string | { path: string; name?: string; isTypeOnly?: boolean } | null
  >
> = {
  "@cosmjs/proto-signing": {
    // Pubkey functions move to @interchainjs/pubkey
    anyToSinglePubkey: "@interchainjs/pubkey",
    decodeOptionalPubkey: "@interchainjs/pubkey",
    decodePubkey: "@interchainjs/pubkey",
    encodePubkey: "@interchainjs/pubkey",
    // DirectSecp256k1HdWallet handled by wallet transformer potentially? Or specific mapping if needed.
    DirectSecp256k1HdWallet: {
      path: "@interchainjs/cosmos/wallets/secp256k1hd", // Example, adjust if needed
      name: "Secp256k1HDWallet",
    },
    makeSignDoc: null, // Often replaced by direct signing functions
    // Add other mappings or removals as needed
  },
  "@cosmjs/stargate": {
    // Client related
    SigningStargateClient: {
      path: "@interchainjs/cosmos/signing-client",
      name: "SigningClient",
    },
    StargateClient: {
      path: "@interchainjs/cosmos/stargate-client",
      name: "QueryClient",
    }, // Assuming QueryClient is the equivalent for read-only
    IndexedTx: { path: "@interchainjs/cosmos", name: "IndexedTx" }, // Check exact path if needed
    TimeoutError: { path: "@interchainjs/cosmos", name: "TimeoutError" }, // Check exact path
    // Fee related (often removed or replaced)
    calculateFee: null,
    GasPrice: null, // Often replaced by direct Fee object construction
    // Query related (check if specific query functions are used)
    QueryClient: { path: "@interchainjs/cosmos", name: "CosmosQueryClient" }, // Or specific query setup
    setupAuthExtension: "@interchainjs/cosmos/modules/auth/queries", // Example, adjust path
    setupBankExtension: "@interchainjs/cosmos/modules/bank/queries", // Example, adjust path
    // ... other setup extensions ...
    // Log/Event related (moved to @interchainjs/utils)
    Attribute: { path: "@interchainjs/utils", isTypeOnly: true }, // Often used as type
    Event: { path: "@interchainjs/utils", isTypeOnly: true }, // Often used as type
    logs: { path: "@interchainjs/utils", name: "parseLogs" }, // Assuming direct replacement
    parseRawLog: { path: "@interchainjs/utils" }, // Moved
    findAttribute: { path: "@interchainjs/utils" }, // Moved
    Log: { path: "@interchainjs/utils", name: "Log", isTypeOnly: true }, // Type moved
    // Transaction success/failure checks (moved to @interchainjs/cosmos/utils)
    assertIsDeliverTxFailure: "@interchainjs/cosmos/utils",
    assertIsDeliverTxSuccess: "@interchainjs/cosmos/utils",
    isDeliverTxFailure: "@interchainjs/cosmos/utils",
    isDeliverTxSuccess: "@interchainjs/cosmos/utils",
    // DeliverTxResponse (moved to @interchainjs/types)
    DeliverTxResponse: { path: "@interchainjs/types", isTypeOnly: true },
    // AminoTypes? Often needs specific handling
    AminoTypes: "@interchainjs/amino", // Or needs more complex transformation
    // StdFee (moved to @interchainjs/amino)
    StdFee: { path: "@interchainjs/amino", isTypeOnly: true },
    // parseCoins (moved to @interchainjs/amino)
    parseCoins: "@interchainjs/amino",
  },
  "@cosmjs/utils": {
    // Direct renames
    arrayContentStartsWith: {
      path: "@interchainjs/utils",
      name: "startsWithArray",
    },
    isNonNullObject: { path: "@interchainjs/utils", name: "isObjectLike" },
    // Keep others that map 1:1
    assert: "@interchainjs/utils",
    sleep: "@interchainjs/utils",
    isUint8Array: "@interchainjs/utils",
    // Add other 1:1 mappings if needed
  },
  // cosmjs-types: Needs careful handling based on specific type path
  // Example for bank MsgSend
  "cosmjs-types/cosmos/bank/v1beta1/tx": {
    MsgSend: { path: "interchainjs/cosmos/bank/v1beta1/tx", isTypeOnly: true },
  },
  // Example for bank QueryBalanceRequest
  "cosmjs-types/cosmos/bank/v1beta1/query": {
    QueryBalanceRequest: {
      path: "@interchainjs/cosmos-types/cosmos/bank/v1beta1/query",
      isTypeOnly: true,
    },
    QueryBalanceResponse: {
      path: "@interchainjs/cosmos-types/cosmos/bank/v1beta1/query",
      isTypeOnly: true,
    },
  },
  // Add more cosmjs-types mappings as encountered
};

interface NewImport {
  path: string;
  specifiers: ts.ImportSpecifier[];
  defaultName?: ts.Identifier;
  isTypeOnly: boolean;
}

/**
 * Creates a TypeScript AST transformer that updates cosmjs import paths and names
 * according to the api-mappings.md.
 */
export function createImportTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const factory = ts.factory;
    let newImportsToAdd: NewImport[] = []; // Accumulator for new imports

    const visitor: ts.Visitor = (node) => {
      if (ts.isImportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const currentPath = node.moduleSpecifier.text;
          const specificMappings = specificImportMap[currentPath];
          const generalMapping = packageMap[currentPath];
          const isTypeOnlyImport = node.importClause?.isTypeOnly ?? false;

          if (specificMappings || generalMapping !== undefined) {
            const originalNamedBindings = node.importClause?.namedBindings;
            const originalDefaultImport = node.importClause?.name;
            let hasChanged = false;

            if (
              originalNamedBindings &&
              ts.isNamedImports(originalNamedBindings)
            ) {
              for (const element of originalNamedBindings.elements) {
                const originalName = element.name.escapedText as string;
                const nameMapping = specificMappings?.[originalName];
                let targetPath: string | undefined;
                let targetName = originalName;
                let targetIsTypeOnly = isTypeOnlyImport || element.isTypeOnly;

                if (nameMapping === null) {
                  // Explicitly remove this import specifier
                  hasChanged = true; // Mark node for potential removal if empty
                  continue; // Skip adding this specifier
                }
                // The previous 'if' ended with 'continue', so 'else' is not needed here.
                if (typeof nameMapping === "string") {
                  targetPath = nameMapping;
                } else if (
                  typeof nameMapping === "object" &&
                  nameMapping !== null
                ) {
                  targetPath = nameMapping.path;
                  targetName = nameMapping.name ?? targetName;
                  targetIsTypeOnly = nameMapping.isTypeOnly ?? targetIsTypeOnly;
                } else if (generalMapping) {
                  // Fallback to general package mapping if no specific mapping for this name
                  targetPath = generalMapping;
                } else {
                  console.warn(
                    `WARN: No specific or general mapping for import '${originalName}' from '${currentPath}'. Keeping original.`,
                  );
                  targetPath = currentPath; // Keep original path if no mapping found at all
                }

                // Find or create the target new import declaration
                let targetImport = newImportsToAdd.find(
                  (imp) =>
                    imp.path === targetPath &&
                    imp.isTypeOnly === targetIsTypeOnly,
                );
                if (!targetImport) {
                  targetImport = {
                    path: targetPath,
                    specifiers: [],
                    isTypeOnly: targetIsTypeOnly,
                  };
                  newImportsToAdd.push(targetImport);
                }

                // Create and add the new import specifier
                targetImport.specifiers.push(
                  factory.createImportSpecifier(
                    element.isTypeOnly, // Preserve original type-only status on specifier
                    element.propertyName, // Keep original alias if it exists
                    factory.createIdentifier(targetName),
                  ),
                );
                hasChanged = true; // Mark that changes occurred
              }
            } else if (originalDefaultImport && generalMapping) {
              // Handle default imports if a general mapping exists
              // Find or create target import for default
              let targetImport = newImportsToAdd.find(
                (imp) =>
                  imp.path === generalMapping &&
                  imp.isTypeOnly === isTypeOnlyImport &&
                  !imp.defaultName,
              );
              if (!targetImport) {
                targetImport = {
                  path: generalMapping,
                  specifiers: [],
                  isTypeOnly: isTypeOnlyImport,
                };
                newImportsToAdd.push(targetImport);
              }
              targetImport.defaultName = originalDefaultImport;
              hasChanged = true;
            } else if (
              originalDefaultImport &&
              currentPath.startsWith("cosmjs-types/")
            ) {
              // Handle default imports from cosmjs-types (often need specific mapping)
              console.warn(
                `WARN: Default import from '${currentPath}' might need manual adjustment.`,
              );
              // Attempt to find a general mapping for cosmjs-types if possible
              const baseCosmjsTypesPath = Object.keys(packageMap).find((p) =>
                currentPath.startsWith(p),
              );
              const interchainTypesPath =
                (baseCosmjsTypesPath
                  ? packageMap[baseCosmjsTypesPath]
                  : null) ?? "@interchainjs/cosmos-types"; // Provide a default
              // Ensure baseCosmjsTypesPath is defined before calling replace
              const newPath = baseCosmjsTypesPath
                ? currentPath.replace(baseCosmjsTypesPath, interchainTypesPath)
                : currentPath.replace("cosmjs-types", interchainTypesPath); // Fallback replace if find fails

              let targetImport = newImportsToAdd.find(
                (imp) =>
                  imp.path === newPath &&
                  imp.isTypeOnly === isTypeOnlyImport &&
                  !imp.defaultName,
              );
              if (!targetImport) {
                targetImport = {
                  path: newPath,
                  specifiers: [],
                  isTypeOnly: isTypeOnlyImport,
                };
                newImportsToAdd.push(targetImport);
              }
              targetImport.defaultName = originalDefaultImport;
              hasChanged = true;
            }

            // If changes were made that require modifying/removing the original import, return undefined
            if (hasChanged) {
              return undefined; // Signal removal of the original node
            }
          } else if (currentPath.startsWith("@cosmjs/")) {
            // Path didn't change and wasn't in the map, but starts with @cosmjs/
            console.warn(
              `WARN: No import mapping found for '${currentPath}'. Manual migration may be required.`,
            );
          } else if (currentPath.startsWith("cosmjs-types")) {
            // Handle unmapped cosmjs-types imports
            const baseCosmjsTypesPath = "cosmjs-types";
            const interchainTypesPath = packageMap[baseCosmjsTypesPath];
            if (interchainTypesPath) {
              const newPath = currentPath.replace(
                baseCosmjsTypesPath,
                interchainTypesPath,
              );
              console.warn(
                `WARN: Assuming generic mapping for '${currentPath}' to '${newPath}'. Verify correctness.`,
              );
              // Recreate the import with the new path
              const newImportNode = factory.updateImportDeclaration(
                node,
                node.modifiers,
                node.importClause,
                factory.createStringLiteral(newPath),
                node.assertClause,
              );
              // Since we are transforming *this* node, we add the potentially transformed version back
              // Need to handle merging if multiple imports from cosmjs-types end up here
              // For simplicity here, just add it directly. Refinement might be needed.
              let targetImport = newImportsToAdd.find(
                (imp) =>
                  imp.path === newPath &&
                  imp.isTypeOnly === (node.importClause?.isTypeOnly ?? false),
              );
              if (!targetImport) {
                targetImport = {
                  path: newPath,
                  specifiers: [],
                  isTypeOnly: node.importClause?.isTypeOnly ?? false,
                };
                newImportsToAdd.push(targetImport);
              }
              if (node.importClause?.name) {
                targetImport.defaultName = node.importClause.name;
              }
              if (
                node.importClause?.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings)
              ) {
                targetImport.specifiers.push(
                  ...node.importClause.namedBindings.elements,
                );
              }

              return undefined; // Remove original
            }
          }
        }
      }
      // Visit children first before processing the current node further
      const visitedNode = ts.visitEachChild(node, visitor, context);

      // If the current node is the SourceFile, add the new import declarations
      if (ts.isSourceFile(visitedNode)) {
        const existingImports = visitedNode.statements.filter(
          ts.isImportDeclaration,
        );
        const otherStatements = visitedNode.statements.filter(
          (stmt) => !ts.isImportDeclaration(stmt),
        );

        const createdImports = newImportsToAdd.map((imp) => {
          const namedImports =
            imp.specifiers.length > 0
              ? factory.createNamedImports(imp.specifiers)
              : undefined;
          const importClause = factory.createImportClause(
            imp.isTypeOnly,
            imp.defaultName,
            namedImports,
          );
          // Only create clause if there's a default or named imports
          const clause =
            imp.defaultName || namedImports ? importClause : undefined;
          return factory.createImportDeclaration(
            undefined, // modifiers
            clause,
            factory.createStringLiteral(imp.path),
            undefined, // assertClause
          );
        });

        // Filter out duplicates that might exist if unchanged imports were also added
        const finalImports = [...existingImports, ...createdImports];
        const uniqueImportMap = new Map<string, ts.ImportDeclaration>();

        for (const impDecl of finalImports) {
          if (
            impDecl.moduleSpecifier &&
            ts.isStringLiteral(impDecl.moduleSpecifier)
          ) {
            const path = impDecl.moduleSpecifier.text;
            const isTypeOnly = impDecl.importClause?.isTypeOnly ?? false;
            const key = `${path}::${isTypeOnly}`; // Simple key for uniqueness

            if (uniqueImportMap.has(key)) {
              // Merge imports from the same path and type-only status
              const existing = uniqueImportMap.get(key);
              if (existing) {
                const mergedClause = mergeImportClauses(
                  factory,
                  existing.importClause,
                  impDecl.importClause,
                );
                if (mergedClause) {
                  uniqueImportMap.set(
                    key,
                    factory.updateImportDeclaration(
                      existing,
                      existing.modifiers,
                      mergedClause,
                      existing.moduleSpecifier,
                      existing.assertClause,
                    ),
                  );
                }
              }
            } else {
              uniqueImportMap.set(key, impDecl);
            }
          }
        }

        // Reset for next file if running transformer multiple times
        newImportsToAdd = [];

        return factory.updateSourceFile(
          visitedNode,
          [...Array.from(uniqueImportMap.values()), ...otherStatements], // Place imports first
          visitedNode.isDeclarationFile,
          visitedNode.referencedFiles,
          visitedNode.typeReferenceDirectives,
          visitedNode.hasNoDefaultLib,
          visitedNode.libReferenceDirectives,
        );
      }

      return visitedNode; // Return the potentially transformed node
    };

    return (sourceFile) => ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}

/** Helper to merge two import clauses */
function mergeImportClauses(
  factory: ts.NodeFactory,
  clause1?: ts.ImportClause,
  clause2?: ts.ImportClause,
): ts.ImportClause | undefined {
  if (!clause1) return clause2;
  if (!clause2) return clause1;

  const isTypeOnly = clause1.isTypeOnly || clause2.isTypeOnly; // If either is type-only, merged is type-only
  const defaultImport = clause1.name ?? clause2.name; // Assume only one default import exists

  const specifiersMap = new Map<string, ts.ImportSpecifier>();

  const addSpecifiers = (bindings?: ts.NamedImportBindings) => {
    if (bindings && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        const name = el.name.text;
        const alias = el.propertyName?.text;
        const key = alias ? `${alias}:${name}` : name; // Use alias:name or name as key
        if (!specifiersMap.has(key)) {
          specifiersMap.set(key, el);
        } else {
          // Handle potential conflicts or duplicates, prioritize non-type-only
          const existing = specifiersMap.get(key);
          if (existing && !existing.isTypeOnly && el.isTypeOnly) {
            // Keep the existing non-type-only version
          } else {
            specifiersMap.set(key, el); // Otherwise, prefer the current one
          }
        }
      }
    }
  };

  addSpecifiers(clause1.namedBindings);
  addSpecifiers(clause2.namedBindings);

  const mergedSpecifiers = Array.from(specifiersMap.values());
  const namedBindings =
    mergedSpecifiers.length > 0
      ? factory.createNamedImports(mergedSpecifiers)
      : undefined;

  if (!defaultImport && !namedBindings) {
    return undefined; // Nothing to import
  }

  return factory.createImportClause(isTypeOnly, defaultImport, namedBindings);
}
