import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import YAML from 'js-yaml';
import { z } from 'zod';
import { starshipConfigSchema } from './starship-config-schema.js';

/**
 * Registers the Starship verification tool with the MCP server.
 * @param server The McpServer instance to register the tool with.
 */
export function registerStarshipConfigVerifyTool(server: McpServer): void {
  server.tool(
    'verifyStarshipConfig',
    'Parses and validates a Starship configuration YAML string against the known schema.',
    {
      yamlContent: z
        .string()
        .describe('The Starship configuration content in YAML format as a string.'),
    },
    async (input) => {
      if (!input.yamlContent) {
        return {
          content: [
            {
              type: 'text',
              text: 'Starship has not been initialized yet. Skipping configuration verification.',
            },
          ],
        };
      }

      try {
        // 1. Parse the YAML string
        // Use load instead of safeLoad as safeLoad is not exposed in type defs
        const parsedConfig = YAML.load(input.yamlContent);

        // Basic check if parsing resulted in something usable
        if (
          typeof parsedConfig !== 'object' ||
          parsedConfig === null ||
          Array.isArray(parsedConfig)
        ) {
          throw new Error('Invalid YAML structure: Expected a top-level object.');
        }

        // 2. Validate the parsed object against the Zod schema
        const validationResult = starshipConfigSchema.safeParse(parsedConfig);

        if (validationResult.success) {
          // Valid configuration
          return {
            content: [
              {
                type: 'text',
                text: 'Starship configuration is valid according to the schema.',
              },
            ],
          };
        }

        // Invalid configuration according to schema
        const errorDetails = validationResult.error.errors
          .map((e) => `- ${e.path.join('.') || 'root'}: ${e.message}`)
          .join('\n');
        return {
          isError: true, // Indicate it's a validation error, not a tool crash
          content: [
            {
              type: 'text',
              text: `Starship configuration is invalid:\n${errorDetails}`,
            },
          ],
        };
      } catch (err: unknown) {
        // Handle YAML parsing errors or other unexpected errors
        let errorMessage = 'Failed to verify Starship configuration.';
        if (err instanceof Error) {
          errorMessage = `Error verifying Starship configuration: ${err.message}`;
        } else {
          errorMessage = `An unknown error occurred during verification: ${String(err)}`;
        }
        console.error('Verification Error:', err);

        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: errorMessage,
            },
          ],
        };
      }
    }
  );
}
