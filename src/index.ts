import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupStarshipTool } from "./starship/tools/setup-starship.js";

// ==== Create server instance ====
const server = new McpServer({
	name: "Hyperweb",
	version: "0.0.1",
});

// ==== Register all MCP tools here ====
server.tool(
	"setupStarship",
	"Setup and use Starship in a project",
	setupStarshipTool.handler,
);

// ==== Start the server ====
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error in main()", error);
	process.exit(1);
});
