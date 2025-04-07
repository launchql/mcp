#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerStarshipConfigGenTool } from "./starship/tools/starship-config-gen.js";
import { registerStarshipSetupTool } from "./starship/tools/starship-setup.js";

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf8"),
);
const VERSION = packageJson.version;

// ==== Start the server ====
async function main() {
  // ==== Create server instance ====
  const server = new McpServer({
    name: "Hyperweb Agentic Tools",
    version: VERSION,
  });

  registerStarshipConfigGenTool(server);
  registerStarshipSetupTool(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Hyperweb Agentic Tools MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main()", error);
  process.exit(1);
});
