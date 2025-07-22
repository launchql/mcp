# @launchql/mcp-server

This project implements a Model Context Protocol (MCP) server that helps you use LaunchQL platform tools better and easier with AI agents.

> 🛠️ This is for the [Hyperweb MCP Server](https://github.com/launchql/mcp). Looking to **generate an MCP server from your blockchain**?  
> Use [Telescope's MCP integration guide](https://docs.hyperweb.io/telescope/Developing/mcp-integration) to get started.

## Setup

To run the LaunchQL MCP server using npx, use the following command:

```bash
npx -y @launchql/mcp-server@latest
```

## Usage with Cursor or Claude Desktop

Add the following configuration. For more information, read the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol) or the [Claude Desktop MCP guide](https://modelcontextprotocol.io/quickstart/user).

```json
{
  "mcpServers": {
    "launchql-mcp-server": {
      "command": "npx",
      "args": ["-y", "@launchql/mcp-server@latest"]
    }
  }
}
```

On Windows, you might need to use this alternative configuration:

```json
{
  "mcpServers": {
    "launchql-mcp-server": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "@launchql/mcp-server@latest"]
    }
  }
}
```

### Available Scripts

- `pnpm build` - Build the project and copy prompts to build directory
- `pnpm clean` - Clean build artifacts
- `pnpm test` - Run tests
- `pnpm inspector` - Run the MCP inspector with the server
- `pnpm format` - Format code using Biome
- `pnpm lint` - Lint code using Biome

### Available Tools

The server provides the following tools:

| Tool Name | Description |
|-----------|-------------|
| pgsqlTest | Create isolated PostgreSQL testing environments with transaction rollbacks, context switching, and seeding |
| graphileTest | GraphQL testing with PostGraphile that builds on top of pgsql-test to provide robust GraphQL testing utilities |

### Development Tools

- **TypeScript** - For static typing and modern JavaScript features
- **Biome** - For linting and formatting
- **Model Context Protocol SDK** - For AI model interactions
- **Zod** - For runtime type validation

## 📦 Project Structure

```md
agentic-tools/
├── src/           # Source code
│   ├── pgsql-test/  # PostgreSQL testing tools and prompts
│   │   ├── tools/ # Tool implementations
│   │   └── prompts/ # Prompt templates
│   └── graphile-test/  # GraphQL testing tools and prompts
│       ├── tools/ # Tool implementations
│       └── prompts/ # Prompt templates
├── build/         # Compiled output
├── .env.example   # Example environment variables
└── biome.json     # Biome configuration
```

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
