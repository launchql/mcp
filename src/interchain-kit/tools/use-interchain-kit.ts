import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const promptPath = join(__dirname, '../prompts', 'use-interchain-kit.md');
const baseSnippetsPath = join(__dirname, '../prompts', 'base-snippets.txt');
const reactSnippetsPath = join(__dirname, '../prompts', 'react-snippets.txt');
const vueSnippetsPath = join(__dirname, '../prompts', 'vue-snippets.txt');
const SNIPPETS_DELIMITER = '\n----------------------------------------\n';

const fallbackInstructions = `
  Please refer to the official documentation at: https://github.com/hyperweb-io/interchain-kit
`;

export function registerUseInterchainKitTool(server: McpServer): void {
  server.tool(
    'useInterchainKit',
    'This tool provides comprehensive examples and usage patterns for the Interchain Kit, call this tool for any Interchain Kit implementation guidance.',
    {
      framework: z.enum(['react', 'vue']).describe('The frontend framework of the project'),
    },
    async ({ framework }) => {
      let text: string;

      try {
        const promptText = readFileSync(promptPath, 'utf-8');
        const baseSnippets = readFileSync(baseSnippetsPath, 'utf-8');
        const frameworkSnippetsPath = framework === 'react' ? reactSnippetsPath : vueSnippetsPath;
        const frameworkSnippets = readFileSync(frameworkSnippetsPath, 'utf-8');

        const combinedSnippets = `${baseSnippets}${SNIPPETS_DELIMITER}${frameworkSnippets}`;
        text = promptText.replace('{{INTERCHAIN_KIT_SNIPPETS}}', combinedSnippets);
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
