import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import YAML from "js-yaml";
import { z } from "zod";

// --- Resource Schema ---
const resourceSchema = z
  .object({
    cpu: z
      .string()
      .optional()
      .describe("CPU resource allocation (e.g., '0.5', '1')"),
    memory: z
      .string()
      .optional()
      .describe("Memory resource allocation (e.g., '200M', '1Gi')"),
  })
  .describe("Resource allocation for CPU and memory");

// --- Chain Ports Schema ---
const chainPortsSchema = z
  .object({
    rest: z.number().int().optional().describe("REST port"),
    rpc: z.number().int().optional().describe("RPC port"),
    grpc: z.number().int().optional().describe("gRPC port"),
    faucet: z.number().int().optional().describe("Faucet port"),
    exposer: z.number().int().optional().describe("Exposer sidecar port"),
  })
  .optional()
  .describe("Port forwarding configuration for the chain's genesis node");

// --- Chain Faucet Schema ---
const chainFaucetSchema = z
  .object({
    enabled: z
      .boolean()
      .optional()
      .default(true)
      .describe("Whether to enable the faucet (default: true)"),
    type: z
      .enum(["cosmjs", "starship"])
      .optional()
      .default("cosmjs")
      .describe("Type of faucet to use (default: cosmjs)"),
    image: z.string().optional().describe("Custom Docker image for the faucet"),
    concurrency: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Number of concurrent requests the faucet can handle"),
    resources: resourceSchema.optional(),
  })
  .optional()
  .describe("Configuration for the chain's faucet service");

// --- Chain Build Schema ---
const chainBuildSchema = z
  .object({
    enabled: z
      .boolean()
      .describe("Whether to enable building the chain binaries on the fly"),
    source: z
      .string()
      .describe("Source to build from (tag, commit, or branch)"),
  })
  .optional()
  .describe("Configuration for building chain binaries during setup");

// --- Chain Upgrade Schema ---
const chainUpgradeSchema = z
  .object({
    enabled: z.boolean().describe("Whether to enable upgrade preparation"),
    type: z
      .literal("build")
      .describe("Type must be 'build' for building upgrade versions"),
    genesis: z.string().describe("Current chain version (tag, branch, commit)"),
    upgrades: z
      .array(
        z.object({
          name: z.string().describe("Upgrade proposal name (e.g., 'v14')"),
          version: z
            .string()
            .describe("Upgrade chain version (tag, branch, commit)"),
        }),
      )
      .min(1)
      .describe("List of upgrade versions to prepare"),
  })
  .optional()
  .describe(
    "Configuration for preparing chain software upgrades using Cosmovisor",
  );

// --- Chain Genesis Schema ---
// Use z.record(z.any()) for flexible patching, validation might be complex
const chainGenesisSchema = z
  .object({
    app_state: z
      .record(z.any())
      .optional()
      .describe("Patches to apply to the 'app_state' section of genesis.json"),
    // Add other top-level genesis fields if needed for patching
  })
  .optional()
  .describe("Patch configuration for the chain's genesis.json file");

// --- Chain Scripts Schema ---
const scriptEntrySchema = z.object({
  file: z.string().describe("Path to the script file, relative to config"),
});
const chainScriptsSchema = z
  .object({
    createGenesis: scriptEntrySchema.optional(),
    updateGenesis: scriptEntrySchema.optional(),
    updateConfig: scriptEntrySchema.optional(),
    createValidator: scriptEntrySchema.optional(),
    transferTokens: scriptEntrySchema.optional(),
    buildChain: scriptEntrySchema.optional(),
  })
  .optional()
  .describe(
    "Override default scripts used during chain setup (Requires using scripts/install.sh)",
  );

// --- Chain CometMock Schema ---
const chainCometMockSchema = z
  .object({
    enabled: z.boolean().describe("Whether to enable CometMock"),
    image: z
      .string()
      .optional()
      .describe("Custom Docker image for CometMock (e.g., version tag)"),
  })
  .optional()
  .describe("Configuration for running the chain with CometMock");

// --- Chain Env Var Schema ---
const chainEnvVarSchema = z
  .object({
    name: z.string().describe("Name of the environment variable"),
    value: z.string().describe("Value of the environment variable"),
  })
  .describe("Environment variable definition");

// --- Chain ICS Schema ---
const chainIcsSchema = z
  .object({
    enabled: z.boolean().describe("Whether to enable Interchain Security"),
    provider: z
      .string()
      .describe("Chain ID of the ICS provider chain for this consumer"),
  })
  .optional()
  .describe(
    "Interchain Security (ICS) configuration (for consumer chains only)",
  );

// --- Chain Balance Schema ---
const chainBalanceSchema = z
  .object({
    address: z.string().describe("Address to receive the balance"),
    amount: z.string().describe("Amount and denom (e.g., '10000uosmo')"),
  })
  .describe("Initial balance for a specific address");

// --- Chain Readiness Probe Schema ---
const chainReadinessProbeSchema = z
  .object({
    exec: z
      .object({
        command: z.array(z.string()).describe("Command array to execute"),
      })
      .optional(),
    // httpGet: ... // Add if needed
    // tcpSocket: ... // Add if needed
    initialDelaySeconds: z
      .number()
      .int()
      .optional()
      .describe("Delay before the first probe"),
    periodSeconds: z
      .number()
      .int()
      .optional()
      .describe("How often to perform the probe"),
    // Add other probe fields like timeoutSeconds, successThreshold, failureThreshold if needed
  })
  .optional()
  .describe("Custom readiness probe configuration for chain pods");

// --- Ethereum Specific Config (Optional within Chain) ---
const ethConfigSchema = z
  .object({
    beacon: z
      .object({
        enabled: z.boolean().optional().default(true),
        image: z.string().optional(),
        numValidator: z.number().int().positive().optional().default(1),
      })
      .optional(),
    validator: z
      .object({
        enabled: z.boolean().optional().default(true),
        image: z.string().optional(),
        numValidator: z.number().int().positive().optional().default(1),
      })
      .optional(),
    prysmctl: z
      .object({
        image: z.string().optional(),
      })
      .optional(),
  })
  .optional()
  .describe(
    "Ethereum-specific configuration (only applicable if name is 'ethereum')",
  );

// --- Updated Chain Schema ---
const chainSchema = z.object({
  id: z.string().describe("Unique identifier for the chain (e.g., osmosis-1)"),
  name: z
    .string()
    .describe(
      "Type of chain (e.g., 'osmosis', 'cosmoshub') or 'custom' for full manual configuration",
    ),
  numValidators: z
    .number()
    .int()
    .positive()
    .describe("Number of validators for the chain (must be >= 1)"),
  image: z
    .string()
    .optional()
    .describe(
      "Override default Docker image for the chain (e.g., 'ghcr.io/osmosis-labs/osmosis:v25.0.0')",
    ),
  home: z
    .string()
    .optional()
    .describe("Home directory path (needed for name: 'custom')"),
  binary: z
    .string()
    .optional()
    .describe("Binary name (needed for name: 'custom')"),
  prefix: z
    .string()
    .optional()
    .describe("Address prefix (needed for name: 'custom')"),
  denom: z
    .string()
    .optional()
    .describe("Primary denomination (needed for name: 'custom')"),
  coins: z
    .string()
    .optional()
    .describe("Genesis coins (e.g., '1000uosmo,1000uion')"),
  hdPath: z
    .string()
    .optional()
    .describe("HD path (e.g., \"m/44'/118'/0'/0/0\")"),
  coinType: z.number().int().optional().describe("Coin type (e.g., 118)"),
  repo: z
    .string()
    .url()
    .optional()
    .describe(
      "Git repository URL (needed for name: 'custom' or build/upgrade)",
    ),
  ports: chainPortsSchema,
  resources: resourceSchema.optional(),
  faucet: chainFaucetSchema,
  build: chainBuildSchema,
  upgrade: chainUpgradeSchema,
  genesis: chainGenesisSchema,
  scripts: chainScriptsSchema,
  cometmock: chainCometMockSchema,
  env: z
    .array(chainEnvVarSchema)
    .optional()
    .describe("Custom environment variables for chain containers"),
  ics: chainIcsSchema,
  balances: z
    .array(chainBalanceSchema)
    .optional()
    .describe("Set initial balances for specific addresses"),
  readinessProbe: chainReadinessProbeSchema,
  config: ethConfigSchema, // Add Ethereum config here
});

// --- Relayer Ports Schema (Hermes only) ---
const relayerPortsSchema = z
  .object({
    rest: z.number().int().optional().describe("Hermes REST API port"),
    exposer: z
      .number()
      .int()
      .optional()
      .describe("Relayer exposer service port"),
  })
  .optional()
  .describe("Port forwarding for the relayer (Hermes only)");

// --- Relayer Config Schema (Hermes only) ---
// Use z.record(z.any()) for flexibility, specific validation is complex
const relayerConfigSchema = z
  .record(z.any())
  .optional()
  .describe(
    "Hermes relayer specific configuration overrides (refer to Hermes config.toml)",
  );

// --- Relayer ICS Schema (Hermes only) ---
const relayerIcsSchema = z
  .object({
    enabled: z
      .boolean()
      .describe("Whether to enable ICS setup for the relayer"),
    consumer: z.string().describe("Chain ID of the ICS consumer chain"),
    provider: z.string().describe("Chain ID of the ICS provider chain"),
  })
  .optional()
  .describe(
    "Interchain Security (ICS) setup for the Hermes relayer connection",
  );

// --- Updated Relayer Schema ---
const relayerSchema = z.object({
  name: z.string().describe("Name for the relayer instance (e.g., osmo-gaia)"),
  type: z
    .enum(["hermes", "ts-relayer", "go-relayer", "neutron-query-relayer"])
    .describe("Type of the relayer"),
  image: z
    .string()
    .optional()
    .describe("Override default Docker image for the relayer"),
  replicas: z
    .literal(1)
    .optional()
    .default(1)
    .describe("Number of replicas (currently only 1 supported)"),
  chains: z
    .array(z.string())
    .min(2)
    .describe("List of chain IDs to connect with this relayer"),
  config: relayerConfigSchema, // Hermes specific
  ports: relayerPortsSchema, // Hermes specific
  ics: relayerIcsSchema, // Hermes specific
});

// --- Updated Explorer Schema ---
const explorerSchema = z
  .object({
    enabled: z.boolean().describe("Whether to enable the explorer"),
    type: z
      .literal("ping-pub")
      .optional()
      .default("ping-pub")
      .describe("Type of explorer (currently only 'ping-pub')"),
    ports: z // Simplified ports object for explorer
      .object({
        rest: z
          .number()
          .int()
          .optional()
          .describe("Local port for explorer UI"),
      })
      .optional(),
    resources: resourceSchema.optional(),
    image: z
      .string()
      .optional()
      .describe("Override default Docker image for the explorer"),
  })
  .optional();

// --- Updated Registry Schema ---
const registrySchema = z
  .object({
    enabled: z.boolean().describe("Whether to enable the registry service"),
    localhost: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "Set API endpoints to localhost using chain ports (default: true)",
      ),
    ports: z // Simplified ports object for registry
      .object({
        rest: z
          .number()
          .int()
          .optional()
          .describe("Local port for registry API"),
      })
      .optional(),
    resources: resourceSchema.optional(),
    image: z
      .string()
      .optional()
      .describe("Override default Docker image for the registry service"),
  })
  .optional();

// --- Define final input schema for GENERATION ---
const starshipConfigInputSchema = z.object({
  configName: z
    .string()
    .optional()
    .default("starship")
    .describe("Top-level configuration name"),
  configVersion: z
    .string()
    .optional()
    .default("1.6.0")
    .describe("Top-level configuration version"),
  chains: z.array(chainSchema).min(1).describe("List of chain configurations"),
  relayers: z
    .array(relayerSchema)
    .optional()
    .describe("List of relayer configurations"),
  explorer: explorerSchema.describe("Explorer configuration"),
  registry: registrySchema.describe("Registry service configuration"),
  // Add ingress schema if needed
});

export type StarshipConfigInput = z.infer<typeof starshipConfigInputSchema>;

// --- Define input schema for VERIFICATION ---
const verifyStarshipConfigInputSchema = z.object({
  yamlContent: z
    .string()
    .describe("The Starship configuration content in YAML format as a string."),
});

export type VerifyStarshipConfigInput = z.infer<
  typeof verifyStarshipConfigInputSchema
>;

// Define the output structure type (more detailed now)
// Using 'any' for nested objects where structure can vary greatly (e.g., genesis, relayer config)
// Consider creating more specific types if needed, but increases complexity
interface StarshipConfig {
  name: string;
  version: string;
  // biome-ignore lint/suspicious/noExplicitAny: Complex, variable structure from Zod input makes precise typing difficult for YAML generation.
  chains: any[]; // Array of chain config objects
  // biome-ignore lint/suspicious/noExplicitAny: Complex, variable structure from Zod input makes precise typing difficult for YAML generation.
  relayers?: any[]; // Array of relayer config objects
  // biome-ignore lint/suspicious/noExplicitAny: Complex, variable structure from Zod input makes precise typing difficult for YAML generation.
  explorer?: any; // Explorer config object
  // biome-ignore lint/suspicious/noExplicitAny: Complex, variable structure from Zod input makes precise typing difficult for YAML generation.
  registry?: any; // Registry config object
}

/**
 * Generates the Starship configuration object based on input.
 * @param input The validated configuration input.
 * @returns The configuration object ready for YAML conversion.
 */
function buildStarshipConfigObject(input: StarshipConfigInput): StarshipConfig {
  // Map chains, only including defined fields
  const chains = input.chains.map((chainInput) => {
    // biome-ignore lint/suspicious/noExplicitAny: Using any for the output object simplifies mapping from the detailed Zod schema to the flexible YAML structure.
    const chainOutput: any = {}; // Start with an empty object
    // Add fields only if they exist in the input
    chainOutput.id = chainInput.id;
    chainOutput.name = chainInput.name;
    chainOutput.numValidators = chainInput.numValidators;
    if (chainInput.image) chainOutput.image = chainInput.image;
    if (chainInput.home) chainOutput.home = chainInput.home;
    if (chainInput.binary) chainOutput.binary = chainInput.binary;
    if (chainInput.prefix) chainOutput.prefix = chainInput.prefix;
    if (chainInput.denom) chainOutput.denom = chainInput.denom;
    if (chainInput.coins) chainOutput.coins = chainInput.coins;
    if (chainInput.hdPath) chainOutput.hdPath = chainInput.hdPath;
    if (chainInput.coinType) chainOutput.coinType = chainInput.coinType;
    if (chainInput.repo) chainOutput.repo = chainInput.repo;
    if (chainInput.ports) chainOutput.ports = chainInput.ports; // Copy ports object directly if present
    if (chainInput.resources) chainOutput.resources = chainInput.resources;
    if (chainInput.faucet) chainOutput.faucet = chainInput.faucet; // Direct copy
    if (chainInput.build) chainOutput.build = chainInput.build; // Direct copy
    if (chainInput.upgrade) chainOutput.upgrade = chainInput.upgrade; // Direct copy
    if (chainInput.genesis) chainOutput.genesis = chainInput.genesis; // Direct copy
    if (chainInput.scripts) chainOutput.scripts = chainInput.scripts; // Direct copy
    if (chainInput.cometmock) chainOutput.cometmock = chainInput.cometmock; // Direct copy
    if (chainInput.env && chainInput.env.length > 0)
      chainOutput.env = chainInput.env;
    if (chainInput.ics) chainOutput.ics = chainInput.ics; // Direct copy
    if (chainInput.balances && chainInput.balances.length > 0)
      chainOutput.balances = chainInput.balances;
    if (chainInput.readinessProbe)
      chainOutput.readinessProbe = chainInput.readinessProbe; // Direct copy
    if (chainInput.name === "ethereum" && chainInput.config)
      chainOutput.config = chainInput.config; // Add Ethereum config if name matches

    return chainOutput;
  });

  // Map relayers, only including defined fields
  const relayers = input.relayers
    ? input.relayers.map((relayerInput) => {
        // biome-ignore lint/suspicious/noExplicitAny: Using any for the output object simplifies mapping from the detailed Zod schema to the flexible YAML structure.
        const relayerOutput: any = {};
        relayerOutput.name = relayerInput.name;
        relayerOutput.type = relayerInput.type;
        if (relayerInput.image) relayerOutput.image = relayerInput.image;
        relayerOutput.replicas = relayerInput.replicas; // Default is 1 handled by Zod
        relayerOutput.chains = relayerInput.chains;
        // Hermes specific fields
        if (relayerInput.type === "hermes") {
          if (relayerInput.config) relayerOutput.config = relayerInput.config;
          if (relayerInput.ports) relayerOutput.ports = relayerInput.ports;
          if (relayerInput.ics) relayerOutput.ics = relayerInput.ics;
        }
        return relayerOutput;
      })
    : undefined;

  // Build explorer config if enabled
  // biome-ignore lint/suspicious/noExplicitAny: Using any for the output object simplifies mapping from the detailed Zod schema to the flexible YAML structure.
  let explorer: any | undefined = undefined;
  if (input.explorer?.enabled) {
    explorer = { enabled: true }; // Base object
    if (input.explorer.type) explorer.type = input.explorer.type;
    if (input.explorer.ports) explorer.ports = input.explorer.ports;
    if (input.explorer.resources) explorer.resources = input.explorer.resources;
    if (input.explorer.image) explorer.image = input.explorer.image;
  }

  // Build registry config if enabled
  // biome-ignore lint/suspicious/noExplicitAny: Using any for the output object simplifies mapping from the detailed Zod schema to the flexible YAML structure.
  let registry: any | undefined = undefined;
  if (input.registry?.enabled) {
    registry = { enabled: true }; // Base object
    if (input.registry.localhost !== undefined)
      // Handle boolean default
      registry.localhost = input.registry.localhost;
    if (input.registry.ports) registry.ports = input.registry.ports;
    if (input.registry.resources) registry.resources = input.registry.resources;
    if (input.registry.image) registry.image = input.registry.image;
  }

  // Construct the final configuration object
  const config: StarshipConfig = {
    name: input.configName, // Defaults handled by Zod
    version: input.configVersion, // Defaults handled by Zod
    chains: chains,
  };

  // Add optional top-level fields if they exist
  if (relayers && relayers.length > 0) {
    config.relayers = relayers;
  }
  if (explorer) {
    config.explorer = explorer;
  }
  if (registry) {
    config.registry = registry;
  }

  return config;
}

/**
 * Takes validated Starship configuration input and returns a YAML string.
 * @param input Validated Starship configuration input.
 * @returns A string containing the Starship configuration in YAML format.
 */
export function generateStarshipYaml(input: StarshipConfigInput): string {
  const configObject = buildStarshipConfigObject(input);
  // Convert the JSON object to YAML format
  // skipInvalid: true prevents YAML.dump from throwing on undefined/function values
  const yamlConfig = YAML.dump(configObject, { skipInvalid: true });
  return yamlConfig;
}

/**
 * Registers the Starship config generation and verification tools with the MCP server.
 * @param server The McpServer instance to register the tools with.
 */
export function registerStarshipConfigGenTool(server: McpServer): void {
  // --- Generate Tool ---
  server.tool(
    "generateStarshipConfig",
    "Generates a Starship configuration file in YAML format based on detailed input options.",
    starshipConfigInputSchema.shape, // Use the generation schema shape
    async (input: StarshipConfigInput) => {
      try {
        const yamlConfig = generateStarshipYaml(input);
        return {
          content: [
            {
              type: "text",
              text: `Starship configuration generated successfully:\n\n\`\`\`yaml\n${yamlConfig}\n\`\`\``,
            },
          ],
        };
      } catch (err: unknown) {
        let errorMessage = `Error generating Starship configuration: ${String(err)}`;
        if (err instanceof z.ZodError) {
          errorMessage = `Input validation error during generation: ${err.errors
            .map((e) => `${e.path.join(".")} - ${e.message}`)
            .join("; ")}`;
          console.error("Zod Validation Error (Generate):", err.flatten());
        } else if (err instanceof Error) {
          errorMessage = `Error generating Starship configuration: ${err.message}`;
          console.error("Generation Error:", err);
        } else {
          console.error("Unknown Generation Error:", err);
        }
        // Use MCP error format
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }
    },
  );

  // --- Verify Tool ---
  server.tool(
    "verifyStarshipConfig",
    "Parses and validates a Starship configuration YAML string against the known schema.",
    verifyStarshipConfigInputSchema.shape, // Use the verification schema shape
    async (input: VerifyStarshipConfigInput) => {
      try {
        // 1. Parse the YAML string
        // Use load instead of safeLoad as safeLoad is not exposed in type defs
        const parsedConfig = YAML.load(input.yamlContent);

        // Basic check if parsing resulted in something usable
        if (
          typeof parsedConfig !== "object" ||
          parsedConfig === null ||
          Array.isArray(parsedConfig)
        ) {
          throw new Error(
            "Invalid YAML structure: Expected a top-level object.",
          );
        }

        // 2. Validate the parsed object against the Zod schema
        const validationResult =
          starshipConfigInputSchema.safeParse(parsedConfig);

        if (validationResult.success) {
          // Valid configuration
          return {
            content: [
              {
                type: "text",
                text: "Starship configuration is valid according to the schema.",
              },
            ],
          };
        }

        // Invalid configuration according to schema
        const errorDetails = validationResult.error.errors
          .map((e) => `- ${e.path.join(".") || "root"}: ${e.message}`)
          .join("\n");
        return {
          isError: true, // Indicate it's a validation error, not a tool crash
          content: [
            {
              type: "text",
              text: `Starship configuration is invalid:\n${errorDetails}`,
            },
          ],
        };
      } catch (err: unknown) {
        // Handle YAML parsing errors or other unexpected errors
        let errorMessage = "Failed to verify Starship configuration.";
        if (err instanceof Error) {
          errorMessage = `Error verifying Starship configuration: ${err.message}`;
        } else {
          errorMessage = `An unknown error occurred during verification: ${String(err)}`;
        }
        console.error("Verification Error:", err);
        // Use MCP error format
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }
    },
  );
}
