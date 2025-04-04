# @hyperweb/agentic-tools

This project implements a Model Context Protocol (MCP) server that helps you use Hyperweb platform tools better and easier with AI agents.

## Setup

To run the Hyperweb MCP server using npx, use the following command:

```bash
npx -y @shopify/dev-mcp@latest
```

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/agentic-tools.git
cd agentic-tools
```

1. Install dependencies:
```bash
pnpm install
```

1. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

## 🔧 Development

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
| starship-config-gen | Generate Starship configuration |
| starship-setup | Setup Starship environment |

### Development Tools

- **TypeScript** - For static typing and modern JavaScript features
- **Biome** - For linting and formatting
- **Model Context Protocol SDK** - For AI model interactions
- **Zod** - For runtime type validation

## 📦 Project Structure

```
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
