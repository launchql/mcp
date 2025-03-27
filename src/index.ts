import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// ==== Create server instance ====
const server = new McpServer({
  name: "Hyperweb",
  version: "0.0.1",
});

// ==== Register all MCP tools here ====

// ==== Start the server ====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Weather MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main()", error);
  process.exit(1);
});
