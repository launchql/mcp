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

## Interchain JavaScript Stack ⚛️

A unified toolkit for building applications and smart contracts in the Interchain ecosystem

| Category              | Tools                                                                                                                  | Description                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **Chain Information**   | [**Chain Registry**](https://github.com/hyperweb-io/chain-registry), [**Utils**](https://www.npmjs.com/package/@chain-registry/utils), [**Client**](https://www.npmjs.com/package/@chain-registry/client) | Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application. |
| **Wallet Connectors**| [**Interchain Kit**](https://github.com/hyperweb-io/interchain-kit)<sup>beta</sup>, [**Cosmos Kit**](https://github.com/hyperweb-io/cosmos-kit) | Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface. |
| **Signing Clients**          | [**InterchainJS**](https://github.com/hyperweb-io/interchainjs)<sup>beta</sup>, [**CosmJS**](https://github.com/cosmos/cosmjs) | A single, universal signing interface for any network |
| **SDK Clients**              | [**Telescope**](https://github.com/hyperweb-io/telescope)                                                          | Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules. |
| **Starter Kits**     | [**Create Interchain App**](https://github.com/hyperweb-io/create-interchain-app)<sup>beta</sup>, [**Create Cosmos App**](https://github.com/hyperweb-io/create-cosmos-app) | Set up a modern Interchain app by running one command. |
| **UI Kits**          | [**Interchain UI**](https://github.com/hyperweb-io/interchain-ui)                                                   | The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit. |
| **Testing Frameworks**          | [**Starship**](https://github.com/hyperweb-io/starship)                                                             | Unified Testing and Development for the Interchain. |
| **TypeScript Smart Contracts** | [**Create Hyperweb App**](https://github.com/hyperweb-io/create-hyperweb-app)                              | Build and deploy full-stack blockchain applications with TypeScript |
| **CosmWasm Contracts** | [**CosmWasm TS Codegen**](https://github.com/CosmWasm/ts-codegen)                                                   | Convert your CosmWasm smart contracts into dev-friendly TypeScript classes. |

## Credits

🛠 Built by Hyperweb (formerly Cosmology) — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/hyperweb-io)

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.