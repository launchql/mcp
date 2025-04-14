import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Configuration ---
const PROMPT_TEMPLATE_PATH = join(
  __dirname,
  "../prompts",
  "migrate-to-interchainjs.md",
);
const API_MAPPINGS_PATH = join(__dirname, "../prompts", "api-mappings.md");

// Removed API_MAPPINGS_PATH as mappings are now inline or in examples
const EXAMPLES_DIR = join(__dirname, "../migration-examples"); // Adjust path as needed

// Paths to example files
const COSMJS_UTILS_EXAMPLE_PATH = join(EXAMPLES_DIR, "cosmjs-utils.ts");
const INTERCHAINJS_UTILS_EXAMPLE_PATH = join(
  EXAMPLES_DIR,
  "interchainjs-utils.ts",
);
const COSMJS_SIGNING_EXAMPLE_PATH = join(EXAMPLES_DIR, "cosmjs-signing.ts");
const INTERCHAINJS_SIGNING_EXAMPLE_PATH = join(
  EXAMPLES_DIR,
  "interchainjs-signing.ts",
);

// Example file paths grouped for easier processing
const EXAMPLE_FILES = [
  {
    title: "Utility Functions Migration",
    cosmjsPath: COSMJS_UTILS_EXAMPLE_PATH,
    interchainjsPath: INTERCHAINJS_UTILS_EXAMPLE_PATH,
  },
  {
    title: "Signing Logic Migration",
    cosmjsPath: COSMJS_SIGNING_EXAMPLE_PATH,
    interchainjsPath: INTERCHAINJS_SIGNING_EXAMPLE_PATH,
  },
  // Add more example pairs here if needed
];

const FALLBACK_MESSAGE = `
  Error: Could not generate the migration prompt.
  For manual migration, refer to: https://github.com/hyperweb-io/interchainjs
`;

// --- Helper Functions ---

/**
 * Reads file content safely.
 * @param filePath - Path to the file.
 * @returns File content as a string or null if reading fails.
 */
function readFileContent(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Formats a pair of CosmJS and InterchainJS code examples into a Markdown string.
 * @param title - The title for this example section.
 * @param cosmjsCode - The CosmJS code snippet.
 * @param interchainjsCode - The corresponding InterchainJS code snippet.
 * @returns A Markdown formatted string for the example.
 */
function formatExampleMarkdown(
  title: string,
  cosmjsCode: string,
  interchainjsCode: string,
): string {
  return `
### ${title}

**CosmJS:**
\`\`\`typescript
${cosmjsCode.trim()}
\`\`\`

**Equivalent InterchainJS:**
\`\`\`typescript
${interchainjsCode.trim()}
\`\`\`
`;
}

/**
 * Builds the migration prompt by injecting formatted examples into the template.
 * The user's code is assumed to be available in the IDE context and is not injected here.
 * @param userCode - The CosmJS code provided by the user (used for validation, not injection).
 * @returns The fully constructed prompt string or null if template or any example file is missing.
 */
function buildMigrationPrompt(): string | null {
  // Keep userCode parameter for potential future validation or use, even if not injected
  const promptTemplate = readFileContent(PROMPT_TEMPLATE_PATH);
  const apiMappings = readFileContent(API_MAPPINGS_PATH);

  if (promptTemplate === null) {
    console.error("Failed to load prompt template file.");
    return null;
  }
  if (apiMappings === null) {
    console.error("Failed to load API mappings file.");
    return null;
  }

  let examplesMarkdown = "";
  for (const example of EXAMPLE_FILES) {
    const cosmjsCode = readFileContent(example.cosmjsPath);
    const interchainjsCode = readFileContent(example.interchainjsPath);

    if (cosmjsCode === null || interchainjsCode === null) {
      console.error(
        `Failed to load one or both example files for '${example.title}'. CosmJS: ${example.cosmjsPath}, InterchainJS: ${example.interchainjsPath}`,
      );
      return null; // Indicate failure if any example file is missing
    }

    examplesMarkdown += formatExampleMarkdown(
      example.title,
      cosmjsCode,
      interchainjsCode,
    );
  }

  // Replace placeholders - first mappings, then examples
  let prompt = promptTemplate.replace("{{API_MAPPINGS}}", apiMappings.trim());
  prompt = prompt.replace("{{MIGRATION_EXAMPLES}}", examplesMarkdown.trim());

  return prompt;
}

// --- MCP Tool Registration ---

/**
 * Registers the MCP tool that generates a detailed prompt for an LLM
 * to migrate CosmJS code to InterchainJS, using inline simple mappings
 * and complex examples loaded from external files.
 */
export function registerMigrateToInterchainjsTool(server: McpServer): void {
  server.tool(
    "migrateToInterchainjs",
    "Generates a prompt for an LLM to migrate CosmJS code to InterchainJS.",
    async () => {
      const prompt = buildMigrationPrompt();

      if (prompt === null) {
        // Error occurred during prompt building (template or examples missing)
        return {
          content: [{ type: "text", text: FALLBACK_MESSAGE }],
        };
      }

      // Successfully generated the prompt
      return {
        content: [{ type: "text", text: prompt }],
      };
    },
  );
}

// console.log("prompt", buildMigrationPrompt());
