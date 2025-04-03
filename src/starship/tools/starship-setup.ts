import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { createTool } from "../../utils/tool-helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const promptPath = join(__dirname, "../prompts", "setup-starship.md");

// Fallback text in case file reading fails
const fallbackText = `# Starship MCP Tool - Automated Setup Guide
Please refer to the documentation for setup instructions.`;

export const setupStarshipTool = createTool(async () => {
  let text: string;

  try {
    text = readFileSync(promptPath, "utf-8");
  } catch (error) {
    text = fallbackText;
  }

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
});

/**
 * Registers the Starship setup tool with the provided MCP server instance.
 * @param server The McpServer instance to register the tool with.
 */
export function registerStarshipSetupTool(server: McpServer): void {
  server.tool(
    "setupStarship",
    "Setup and use Starship in a project",
    setupStarshipTool.handler,
  );
}
