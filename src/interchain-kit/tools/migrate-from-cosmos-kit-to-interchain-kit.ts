import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Configuration ---
const MIGRATION_GUIDE_PATH = join(__dirname, '../prompts', 'cosmos-kit-to-interchain-kit-migration.md');

const FALLBACK_MESSAGE = `
  Error: Could not load the CosmosKit to InterchainKit migration guide.
  Please ensure the file exists at: ${MIGRATION_GUIDE_PATH}
  For manual assistance, refer to the InterchainKit documentation.
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

/**
 * Builds the migration prompt by reading the dedicated migration guide.
 * @returns The migration guide content as a string or null if the file is missing.
 */
function buildMigrationPrompt(): string | null {
  const migrationGuideContent = readFileContent(MIGRATION_GUIDE_PATH);

  if (migrationGuideContent === null) {
    console.error(`Failed to load migration guide file: ${MIGRATION_GUIDE_PATH}`);
    return null;
  }

  return migrationGuideContent;
}

export function registerMigrateFromCosmosKitToInterchainKitTool(server: McpServer): void {
  server.tool(
    'migrateFromCosmosKitToInterchainKit',
    "Migrate a project from CosmosKit to InterchainKit using the provided migration guide. The user's code to be migrated is expected to be available in the IDE context.",
    {}, // Use an empty object literal for an empty input shape
    async () => {
      const prompt = buildMigrationPrompt();

      if (prompt === null) {
        return {
          content: [{ type: 'text', text: FALLBACK_MESSAGE }],
        };
      }

      return {
        content: [{ type: 'text', text: prompt }],
      };
    }
  );
}
