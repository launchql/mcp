import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptPath = join(__dirname, '../prompts', 'use-interchainjs.md');
const snippetsPath = join(__dirname, '../prompts', 'interchainjs-snippets.txt');

const fallbackInstructions = `
  Please refer to the official documentation at: https://docs.hyperweb.io/interchain-js
`;

export function registerUseInterchainjsTool(server: McpServer): void {
  server.tool(
    'useInterchainjs',
    'This tool provides comprehensive examples and usage patterns for the InterchainJS library, call this tool for any InterchainJS implementation guidance.',
    async () => {
      let text: string;

      try {
        let promptText = readFileSync(promptPath, 'utf-8');
        const snippetsText = readFileSync(snippetsPath, 'utf-8');

        text = promptText.replace('{{INTERCHAINJS_SNIPPETS}}', snippetsText);
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
