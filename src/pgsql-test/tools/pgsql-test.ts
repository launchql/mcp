import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptPath = join(__dirname, '../prompts', 'pgsql-test.md');

const fallbackInstructions = `
  Please refer to the official documentation at: https://github.com/launchql/launchql/tree/main/packages/pgsql-test
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

export function registerPgsqlTestTool(server: McpServer): void {
  server.tool(
    'pgsqlTest',
    'This tool provides comprehensive examples and usage patterns for pgsql-test, a utility for creating isolated PostgreSQL testing environments with transaction rollbacks, context switching, and seeding.',
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
