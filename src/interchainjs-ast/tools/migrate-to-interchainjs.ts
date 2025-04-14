import { readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createTool } from "../../utils/tool-helpers.js";
import { transformCosmjsToInterchainjs } from "../migration/transformer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Removed promptPath as it's no longer used in this version

const fallbackInstructions = `
  Migration failed. Please check the file path and permissions.
  For manual migration, refer to: https://github.com/hyperweb-io/interchainjs
`;

// Define the input schema for the tool - expecting a file path
const migrateInputSchema = z.object({
	filePath: z
		.string()
		.describe("The path to the CosmJS TypeScript file to migrate."),
});

// Infer the input type from the schema
type MigrateInput = z.infer<typeof migrateInputSchema>;

// Extract the shape from the input schema
const migrateInputShape = migrateInputSchema.shape;

// Define the type for the 'args' parameter based on the input schema directly
// Assumes the framework passes the parsed input object directly when given the shape.
type MigrateHandlerArgs = MigrateInput;

const migrationTool = createTool(
	migrateInputShape,
	async (args: MigrateHandlerArgs) => {
		// Args should now be the parsed input object directly
		const filePath = args.filePath;
		console.log(`Attempting migration for file: ${filePath}`);

		let inputCode: string;
		try {
			inputCode = readFileSync(filePath, "utf-8");
			console.log(`Successfully read file: ${filePath}`);
		} catch (error: unknown) {
			console.error(`Failed to read file ${filePath}:`, error);
			const errorMessage = `// Error reading file: ${filePath}. ${error instanceof Error ? error.message : String(error)}`;
			return {
				content: [{ type: "text", text: errorMessage }],
				interchainjsCode: errorMessage,
				isError: true,
			};
		}

		try {
			const transformedCode = transformCosmjsToInterchainjs(inputCode);
			console.log("AST transformation successful.");
			console.log("Transformed code:");
			console.log(transformedCode);
			console.log("--------------------------------");

			try {
				writeFileSync(filePath, transformedCode, "utf-8");
				console.log(`Successfully wrote migrated code back to: ${filePath}`);
			} catch (writeError: unknown) {
				console.error(
					`Failed to write transformed code back to ${filePath}:`,
					writeError,
				);
				const writeErrorMessage = `// Error writing file: ${filePath}. ${writeError instanceof Error ? writeError.message : String(writeError)}`;
				// Return the transformed code even if writing failed, but indicate the error
				return {
					content: [
						{ type: "text", text: transformedCode },
						{ type: "text", text: `\n\n${writeErrorMessage}` },
					],
					interchainjsCode: transformedCode,
					isError: true, // Indicate an error occurred during the process
				};
			}

			// Success case (read, transform, write)
			return {
				content: [{ type: "text", text: transformedCode }],
			};
		} catch (transformError: unknown) {
			console.error("AST Transformation failed:", transformError);
			const errorMessage =
				transformError instanceof Error
					? transformError.message
					: String(transformError);
			const errorText = `// Migration failed during transformation: ${errorMessage}`;
			return {
				content: [{ type: "text", text: errorText }],
				isError: true,
			};
		}
	},
);

/**
 * Registers the MCP tool for migrating a CosmJS file to InterchainJS in place.
 */
export function registerMigrateToInterchainjsTool(server: McpServer): void {
	server.tool(
		"migrateToInterchainjs",
		"Reads a CosmJS file, migrates it to InterchainJS using AST transformations, writes it back, and returns the result.",
		migrationTool.schema, // Pass the extracted input shape
		migrationTool.handler,
	);
}

// migrationTool.handler({
// 	filePath: "data/ast-transformed/cosmjs-full-test.ts",
// });
