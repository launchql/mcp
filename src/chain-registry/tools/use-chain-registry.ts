import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptPath = join(__dirname, '../prompts', 'use-chain-registry.md');
const v1SnippetsPath = join(__dirname, '../prompts', 'v1-snippets.txt');
const v2SnippetsPath = join(__dirname, '../prompts', 'v2-snippets.txt');

const fallbackInstructions = `
  Please refer to the official documentation at: https://github.com/hyperweb-io/chain-registry
`;

export function registerUseChainRegistryTool(server: McpServer): void {
  server.tool(
    'useChainRegistry',
    'This tool provides comprehensive examples and usage patterns for the Chain Registry, call this tool for any Chain Registry implementation guidance.',
    {
      majorVersion: z.enum(['v1', 'v2']).describe('The major version of the Chain Registry to use'),
    },
    async ({ majorVersion }) => {
      let text: string;

      try {
        let promptText = readFileSync(promptPath, 'utf-8');
        const snippetsPath = majorVersion === 'v1' ? v1SnippetsPath : v2SnippetsPath;
        const snippetsText = readFileSync(snippetsPath, 'utf-8');

        text = promptText.replace('{{CHAIN_REGISTRY_SNIPPETS}}', snippetsText);
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
