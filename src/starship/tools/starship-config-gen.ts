import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths for documentation and type definitions
const DOCS_PATH = join(__dirname, '../data/starship-config-docs.md');
const TYPES_PATH = join(__dirname, '../data/config-types.ts');
const PROMPT_PATH = join(__dirname, '../prompts/generate-starship-config.md');

const fallbackInstructions = `
  Please refer to the official documentation at: https://docs.hyperweb.io/starship/config
`;

/**
 * Reads and returns the content of a file
 * @param path - Path to the file
 * @returns Content of the file as string
 */
function readFileContent(path: string): string {
  try {
    return readFileSync(path, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return '';
  }
}

/**
 * Registers the Starship config generation tool with the MCP server.
 * @param server The McpServer instance to register the tool with.
 */
export function registerStarshipConfigGenTool(server: McpServer): void {
  server.tool(
    'generateStarshipConfig',
    'This tool helps generate Starship configuration files by providing comprehensive documentation and type definitions.',
    async () => {
      try {
        // Read the base prompt template
        let promptText = readFileContent(PROMPT_PATH);

        // Read documentation and type definitions
        const docsContent = readFileContent(DOCS_PATH);
        const typesContent = readFileContent(TYPES_PATH);

        // Replace placeholders in the prompt template
        promptText = promptText
          .replace('{{STARSHIP_CONFIG_DOCS}}', docsContent)
          .replace('{{STARSHIP_CONFIG_TYPES}}', typesContent);

        return {
          content: [
            {
              type: 'text',
              text: promptText,
            },
          ],
        };
      } catch (error) {
        console.error('Error generating Starship configuration guide:', error);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: fallbackInstructions,
            },
          ],
        };
      }
    }
  );
}
