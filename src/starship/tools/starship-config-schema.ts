import { z } from 'zod';

// --- Resource Schema ---
const resourceSchema = z
  .object({
    cpu: z.string().optional().describe("CPU resource allocation (e.g., '0.5', '1')"),
    memory: z.string().optional().describe("Memory resource allocation (e.g., '200M', '1Gi')"),
  })
  .describe('Resource allocation for CPU and memory');

// --- Chain Ports Schema ---
const chainPortsSchema = z
  .object({
    rest: z.number().int().optional().describe('REST port'),
    rpc: z.number().int().optional().describe('RPC port'),
    grpc: z.number().int().optional().describe('gRPC port'),
    faucet: z.number().int().optional().describe('Faucet port'),
    exposer: z.number().int().optional().describe('Exposer sidecar port'),
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
      .describe('Whether to enable the faucet (default: true)'),
    type: z
      .enum(['cosmjs', 'starship'])
      .optional()
      .default('cosmjs')
      .describe('Type of faucet to use (default: cosmjs)'),
    image: z.string().optional().describe('Custom Docker image for the faucet'),
    concurrency: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of concurrent requests the faucet can handle'),
    resources: resourceSchema.optional(),
  })
  .optional()
  .describe("Configuration for the chain's faucet service");

// --- Chain Build Schema ---
const chainBuildSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable building the chain binaries on the fly'),
    source: z.string().describe('Source to build from (tag, commit, or branch)'),
  })
  .optional()
  .describe('Configuration for building chain binaries during setup');

// --- Chain Upgrade Schema ---
const chainUpgradeSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable upgrade preparation'),
    type: z.literal('build').describe("Type must be 'build' for building upgrade versions"),
    genesis: z.string().describe('Current chain version (tag, branch, commit)'),
    upgrades: z
      .array(
        z.object({
          name: z.string().describe("Upgrade proposal name (e.g., 'v14')"),
          version: z.string().describe('Upgrade chain version (tag, branch, commit)'),
        })
      )
      .min(1)
      .describe('List of upgrade versions to prepare'),
  })
  .optional()
  .describe('Configuration for preparing chain software upgrades using Cosmovisor');

// --- Chain Genesis Schema ---
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
  file: z.string().describe('Path to the script file, relative to config'),
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
  .describe('Override default scripts used during chain setup (Requires using scripts/install.sh)');

// --- Chain CometMock Schema ---
const chainCometMockSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable CometMock'),
    image: z.string().optional().describe('Custom Docker image for CometMock (e.g., version tag)'),
  })
  .optional()
  .describe('Configuration for running the chain with CometMock');

// --- Chain Env Var Schema ---
const chainEnvVarSchema = z
  .object({
    name: z.string().describe('Name of the environment variable'),
    value: z.string().describe('Value of the environment variable'),
  })
  .describe('Environment variable definition');

// --- Chain ICS Schema ---
const chainIcsSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable Interchain Security'),
    provider: z.string().describe('Chain ID of the ICS provider chain for this consumer'),
  })
  .optional()
  .describe('Interchain Security (ICS) configuration (for consumer chains only)');

// --- Chain Balance Schema ---
const chainBalanceSchema = z
  .object({
    address: z.string().describe('Address to receive the balance'),
    amount: z.string().describe("Amount and denom (e.g., '10000uosmo')"),
  })
  .describe('Initial balance for a specific address');

// --- Chain Readiness Probe Schema ---
const chainReadinessProbeSchema = z
  .object({
    exec: z
      .object({
        command: z.array(z.string()).describe('Command array to execute'),
      })
      .optional(),
    // httpGet: ... // Add if needed
    // tcpSocket: ... // Add if needed
    initialDelaySeconds: z.number().int().optional().describe('Delay before the first probe'),
    periodSeconds: z.number().int().optional().describe('How often to perform the probe'),
  })
  .optional()
  .describe('Custom readiness probe configuration for chain pods');

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
  .describe("Ethereum-specific configuration (only applicable if name is 'ethereum')");

// --- Updated Chain Schema ---
const chainSchema = z.object({
  id: z.string().describe('Unique identifier for the chain (e.g., osmosis-1)'),
  name: z
    .string()
    .describe(
      "Type of chain (e.g., 'osmosis', 'cosmoshub') or 'custom' for full manual configuration"
    ),
  numValidators: z
    .number()
    .int()
    .positive()
    .describe('Number of validators for the chain (must be >= 1)'),
  image: z
    .string()
    .optional()
    .describe(
      "Override default Docker image for the chain (e.g., 'ghcr.io/osmosis-labs/osmosis:v25.0.0')"
    ),
  home: z.string().optional().describe("Home directory path (needed for name: 'custom')"),
  binary: z.string().optional().describe("Binary name (needed for name: 'custom')"),
  prefix: z.string().optional().describe("Address prefix (needed for name: 'custom')"),
  denom: z.string().optional().describe("Primary denomination (needed for name: 'custom')"),
  coins: z.string().optional().describe("Genesis coins (e.g., '1000uosmo,1000uion')"),
  hdPath: z.string().optional().describe("HD path (e.g., \"m/44'/118'/0'/0/0\")"),
  coinType: z.number().int().optional().describe('Coin type (e.g., 118)'),
  repo: z
    .string()
    .url()
    .optional()
    .describe("Git repository URL (needed for name: 'custom' or build/upgrade)"),
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
    .describe('Custom environment variables for chain containers'),
  ics: chainIcsSchema,
  balances: z
    .array(chainBalanceSchema)
    .optional()
    .describe('Set initial balances for specific addresses'),
  readinessProbe: chainReadinessProbeSchema,
  config: ethConfigSchema, // Add Ethereum config here
});

// --- Relayer Ports Schema (Hermes only) ---
const relayerPortsSchema = z
  .object({
    rest: z.number().int().optional().describe('Hermes REST API port'),
    exposer: z.number().int().optional().describe('Relayer exposer service port'),
  })
  .optional()
  .describe('Port forwarding for the relayer (Hermes only)');

// --- Relayer Config Schema (Hermes only) ---
const relayerConfigSchema = z
  .record(z.any())
  .optional()
  .describe('Hermes relayer specific configuration overrides (refer to Hermes config.toml)');

// --- Relayer ICS Schema (Hermes only) ---
const relayerIcsSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable ICS setup for the relayer'),
    consumer: z.string().describe('Chain ID of the ICS consumer chain'),
    provider: z.string().describe('Chain ID of the ICS provider chain'),
  })
  .optional()
  .describe('Interchain Security (ICS) setup for the Hermes relayer connection');

// --- Updated Relayer Schema ---
const relayerSchema = z.object({
  name: z.string().describe('Name for the relayer instance (e.g., osmo-gaia)'),
  type: z
    .enum(['hermes', 'ts-relayer', 'go-relayer', 'neutron-query-relayer'])
    .describe('Type of the relayer'),
  image: z.string().optional().describe('Override default Docker image for the relayer'),
  replicas: z
    .literal(1)
    .optional()
    .default(1)
    .describe('Number of replicas (currently only 1 supported)'),
  chains: z.array(z.string()).min(2).describe('List of chain IDs to connect with this relayer'),
  config: relayerConfigSchema, // Hermes specific
  ports: relayerPortsSchema, // Hermes specific
  ics: relayerIcsSchema, // Hermes specific
});

// --- Updated Explorer Schema ---
const explorerSchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable the explorer'),
    type: z
      .literal('ping-pub')
      .optional()
      .default('ping-pub')
      .describe("Type of explorer (currently only 'ping-pub')"),
    ports: z // Simplified ports object for explorer
      .object({
        rest: z.number().int().optional().describe('Local port for explorer UI'),
      })
      .optional(),
    resources: resourceSchema.optional(),
    image: z.string().optional().describe('Override default Docker image for the explorer'),
  })
  .optional();

// --- Updated Registry Schema ---
const registrySchema = z
  .object({
    enabled: z.boolean().describe('Whether to enable the registry service'),
    localhost: z
      .boolean()
      .optional()
      .default(true)
      .describe('Set API endpoints to localhost using chain ports (default: true)'),
    ports: z // Simplified ports object for registry
      .object({
        rest: z.number().int().optional().describe('Local port for registry API'),
      })
      .optional(),
    resources: resourceSchema.optional(),
    image: z.string().optional().describe('Override default Docker image for the registry service'),
  })
  .optional();

// --- Define final input schema for GENERATION ---
export const starshipConfigSchema = z.object({
  name: z.string().optional().default('starship').describe('Top-level configuration name'),
  version: z.string().optional().default('1.6.0').describe('Top-level configuration version'),
  chains: z.array(chainSchema).min(1).describe('List of chain configurations'),
  relayers: z.array(relayerSchema).optional().describe('List of relayer configurations'),
  explorer: explorerSchema.describe('Explorer configuration'),
  registry: registrySchema.describe('Registry service configuration'),
  // Add ingress schema if needed
});
