import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptPath = join(__dirname, '../prompts', 'graphile-test.md');

const fallbackInstructions = `
  Please refer to the official documentation at: https://github.com/launchql/launchql/tree/main/packages/graphile-test
`;

/**
 * Reads file content safely.
 * @param filePath - Path to the file.
 * @returns File content as a string or null if reading fails.
 */
function readFileContent(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

export function registerGraphileTestTool(server: McpServer): void {
  server.tool(
    'graphileTest',
    'This tool provides comprehensive examples and usage patterns for graphile-test, a utility for GraphQL testing with PostGraphile that builds on top of pgsql-test to provide robust GraphQL testing utilities.',
    {},
    async () => {
      let text: string;

      try {
        const promptText = readFileContent(promptPath);
        if (promptText === null) {
          throw new Error(`Failed to load prompt file: ${promptPath}`);
        }
        text = promptText;
      } catch (error) {
        text = fallbackInstructions;
      }

      return {
        content: [
          {
            type: 'text',
            text,
          },
        ],
      };
    }
  );
}
