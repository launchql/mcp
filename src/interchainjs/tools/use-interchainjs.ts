import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NETWORKS = ['cosmos', 'injective', 'ethereum'] as const;
type NetworkType = (typeof NETWORKS)[number];

const SNIPPETS_DIR = join(__dirname, '../prompts/snippets');
const PROMPT_PATH = join(__dirname, '../prompts', 'use-interchainjs.md');

const NETWORK_SNIPPETS: Record<NetworkType, string> = {
  cosmos: join(SNIPPETS_DIR, 'cosmos.txt'),
  injective: join(SNIPPETS_DIR, 'injective.txt'),
  ethereum: join(SNIPPETS_DIR, 'ethereum.txt'),
};

const COMMON_SNIPPETS_PATH = join(SNIPPETS_DIR, 'common.txt');

const fallbackInstructions = `
  Please refer to the official documentation at: https://docs.hyperweb.io/interchain-js
`;

const delimiter = '\n\n----------------------------------------\n\n';

/**
 * Reads and combines network-specific and common snippets
 * @param network - The target network
 * @returns Combined snippets with network-specific ones first
 */
function getSnippetsForNetwork(network: NetworkType): string {
  try {
    const networkSnippetsPath = NETWORK_SNIPPETS[network];
    const networkSnippets = readFileSync(networkSnippetsPath, 'utf-8');
    const commonSnippets = readFileSync(COMMON_SNIPPETS_PATH, 'utf-8');

    // Combine snippets with network-specific ones first
    return `${networkSnippets}${delimiter}${commonSnippets}`;
  } catch (error) {
    console.error(`Error reading snippets for network ${network}:`, error);
    return '';
  }
}

export function registerUseInterchainjsTool(server: McpServer): void {
  server.tool(
    'useInterchainjs',
    'This tool provides comprehensive examples and usage patterns for the InterchainJS library. Specify the target network to get relevant examples.',
    {
      network: z
        .enum(NETWORKS)
        .describe('The target network for which to provide InterchainJS examples and patterns.'),
    },
    async ({ network }) => {
      try {
        const promptText = readFileSync(PROMPT_PATH, 'utf-8');
        const snippetsText = getSnippetsForNetwork(network as NetworkType);

        if (!snippetsText) {
          throw new Error(`No snippets available for network: ${network}`);
        }

        const text = promptText.replace('{{INTERCHAINJS_SNIPPETS}}', snippetsText);

        return {
          content: [
            {
              type: 'text',
              text,
            },
          ],
        };
      } catch (error) {
        console.error('Error generating InterchainJS usage guide:', error);
        return {
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
