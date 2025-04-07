# @hyperweb/mcp-server

This project implements a Model Context Protocol (MCP) server that helps you use Hyperweb platform tools better and easier with AI agents.

## Setup

To run the Hyperweb MCP server using npx, use the following command:

```bash
npx -y @hyperweb/mcp-server@latest
```

## Usage with Cursor or Claude Desktop

Add the following configuration. For more information, read the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol) or the [Claude Desktop MCP guide](https://modelcontextprotocol.io/quickstart/user).

```json
{
  "mcpServers": {
    "hyperweb-mcp-server": {
      "command": "npx",
      "args": ["-y", "@hyperweb/mcp-server@latest"]
    }
  }
}
```

On Windows, you might need to use this alternative configuration:

```json
{
  "mcpServers": {
    "hyperweb-mcp-server": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "@hyperweb/mcp-server@latest"]
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
| generateStarshipConfig | Generate Starship configuration |
| verifyStarshipConfig | Verify a Starship configuration |
| setupStarship | Setup Starship environment |

### Development Tools

- **TypeScript** - For static typing and modern JavaScript features
- **Biome** - For linting and formatting
- **Model Context Protocol SDK** - For AI model interactions
- **Zod** - For runtime type validation

## 📦 Project Structure

```md
agentic-tools/
├── src/           # Source code
│   └── starship/  # Starship-related tools and prompts
│       ├── tools/ # Tool implementations
│       └── prompts/ # Prompt templates
├── build/         # Compiled output
├── .env.example   # Example environment variables
└── biome.json     # Biome configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol/sdk)
