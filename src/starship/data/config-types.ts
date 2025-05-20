// Top-level configuration interface
export interface StarshipConfig {
  /** Top-level configuration name */
  name: string;
  /** Top-level configuration version (default: '1.6.0') */
  version: string;
  /** List of chain configurations (minimum: 1) */
  chains: ChainOutput[];
  /** List of relayer configurations (optional) */
  relayers?: RelayerOutput[];
  /** Explorer configuration (optional) */
  explorer?: ExplorerOutput;
  /** Registry service configuration (optional) */
  registry?: RegistryOutput;
}

// --- Output Type Definitions ---

/** Port forwarding configuration for the chain's genesis node */
export interface PortConfig {
  /** REST port */
  rest?: number;
  /** RPC port */
  rpc?: number;
  /** gRPC port */
  grpc?: number;
  /** Faucet port */
  faucet?: number;
  /** Exposer sidecar port */
  exposer?: number;
}

/** Resource allocation for CPU and memory */
interface ResourceConfig {
  /** CPU resource allocation (e.g., '0.5', '1') */
  cpu?: string;
  /** Memory resource allocation (e.g., '200M', '1Gi') */
  memory?: string;
}

/** Configuration for the chain's faucet service */
interface FaucetConfig {
  /** Whether to enable the faucet (default: true) */
  enabled?: boolean;
  /** Type of faucet to use (default: 'cosmjs', allowed: ['cosmjs', 'starship']) */
  type?: 'cosmjs' | 'starship';
  /** Custom Docker image for the faucet */
  image?: string;
  /** Number of concurrent requests the faucet can handle */
  concurrency?: number;
  /** Resource allocation for the faucet */
  resources?: ResourceConfig;
}

/** Configuration for building chain binaries during setup */
interface BuildConfig {
  /** Whether to enable building the chain binaries on the fly */
  enabled: boolean;
  /** Source to build from (tag, commit, or branch) */
  source: string;
}

interface UpgradeEntry {
  /** Upgrade proposal name (e.g., 'v14') */
  name: string;
  /** Upgrade chain version (tag, branch, commit) */
  version: string;
}

/** Configuration for preparing chain software upgrades using Cosmovisor */
interface UpgradeConfig {
  /** Whether to enable upgrade preparation */
  enabled: boolean;
  /** Type must be 'build' for building upgrade versions */
  type: 'build';
  /** Current chain version (tag, branch, commit) */
  genesis: string;
  /** List of upgrade versions to prepare (minimum: 1) */
  upgrades: UpgradeEntry[];
}

/** Patch configuration for the chain's genesis.json file */
export interface GenesisConfig {
  /** Patches to apply to the 'app_state' section of genesis.json */
  app_state?: Record<string, unknown>;
}

interface ScriptEntry {
  /** Path to the script file, relative to config */
  file: string;
}

/** Override default scripts used during chain setup (Requires using scripts/install.sh) */
interface ScriptsConfig {
  createGenesis?: ScriptEntry;
  updateGenesis?: ScriptEntry;
  updateConfig?: ScriptEntry;
  createValidator?: ScriptEntry;
  transferTokens?: ScriptEntry;
  buildChain?: ScriptEntry;
}

/** Configuration for running the chain with CometMock */
interface CometMockConfig {
  /** Whether to enable CometMock */
  enabled: boolean;
  /** Custom Docker image for CometMock (e.g., version tag) */
  image?: string;
}

/** Environment variable definition */
interface EnvVar {
  /** Name of the environment variable */
  name: string;
  /** Value of the environment variable */
  value: string;
}

/** Interchain Security (ICS) configuration (for consumer chains only) */
interface IcsConfig {
  /** Whether to enable Interchain Security */
  enabled: boolean;
  /** Chain ID of the ICS provider chain for this consumer */
  provider: string;
}

/** Initial balance for a specific address */
interface BalanceEntry {
  /** Address to receive the balance */
  address: string;
  /** Amount and denom (e.g., '10000uosmo') */
  amount: string;
}

/** Custom readiness probe configuration for chain pods */
interface ReadinessProbeExec {
  /** Command array to execute */
  command: string[];
}
interface ReadinessProbeConfig {
  exec?: ReadinessProbeExec;
  /** Delay before the first probe */
  initialDelaySeconds?: number;
  /** How often to perform the probe */
  periodSeconds?: number;
}

/** Ethereum-specific configuration (only applicable if name is 'ethereum') */
interface EthSubConfig {
  /** Whether to enable this component (default: true) */
  enabled?: boolean;
  /** Custom Docker image for this component */
  image?: string;
  /** Number of validators (default: 1, must be positive) */
  numValidator?: number;
}

interface EthConfigOutput {
  beacon?: EthSubConfig;
  validator?: EthSubConfig;
  prysmctl?: { image?: string };
}

export interface ChainOutput {
  /** Unique identifier for the chain (e.g., osmosis-1) */
  id: string;
  /** Type of chain (e.g., 'osmosis', 'cosmoshub') or 'custom' for full manual configuration */
  name: string;
  /** Number of validators for the chain (must be >= 1) */
  numValidators: number;
  /** Override default Docker image for the chain (e.g., 'ghcr.io/osmosis-labs/osmosis:v25.0.0') */
  image?: string;
  /** Home directory path (needed for name: 'custom') */
  home?: string;
  /** Binary name (needed for name: 'custom') */
  binary?: string;
  /** Address prefix (needed for name: 'custom') */
  prefix?: string;
  /** Primary denomination (needed for name: 'custom') */
  denom?: string;
  /** Genesis coins (e.g., '1000uosmo,1000uion') */
  coins?: string;
  /** HD path (e.g., "m/44'/118'/0'/0/0") */
  hdPath?: string;
  /** Coin type (e.g., 118) */
  coinType?: number;
  /** Git repository URL (needed for name: 'custom' or build/upgrade) */
  repo?: string;
  ports?: PortConfig;
  resources?: ResourceConfig;
  faucet?: FaucetConfig;
  build?: BuildConfig;
  upgrade?: UpgradeConfig;
  genesis?: GenesisConfig;
  scripts?: ScriptsConfig;
  cometmock?: CometMockConfig;
  /** Custom environment variables for chain containers */
  env?: EnvVar[];
  ics?: IcsConfig;
  /** Set initial balances for specific addresses */
  balances?: BalanceEntry[];
  readinessProbe?: ReadinessProbeConfig;
  config?: EthConfigOutput;
}

/** Port forwarding for the relayer (Hermes only) */
export interface RelayerPortsConfig {
  /** Hermes REST API port */
  rest?: number;
  /** Relayer exposer service port */
  exposer?: number;
}

/** Interchain Security (ICS) setup for the Hermes relayer connection */
interface RelayerHermesConfig {
  /** Hermes relayer specific configuration overrides (refer to Hermes config.toml) */
  config?: Record<string, unknown>;
  ports?: RelayerPortsConfig;
  /** ICS configuration for Hermes */
  ics?: {
    /** Whether to enable ICS setup for the relayer */
    enabled: boolean;
    /** Chain ID of the ICS consumer chain */
    consumer: string;
    /** Chain ID of the ICS provider chain */
    provider: string;
  };
}

export interface RelayerOutput {
  /** Name for the relayer instance (e.g., osmo-gaia) */
  name: string;
  /** Type of the relayer (allowed: ['hermes', 'ts-relayer', 'go-relayer', 'neutron-query-relayer']) */
  type: 'hermes' | 'ts-relayer' | 'go-relayer' | 'neutron-query-relayer';
  /** Override default Docker image for the relayer */
  image?: string;
  /** Number of replicas (currently only 1 supported, default: 1) */
  replicas?: number;
  /** List of chain IDs to connect with this relayer (minimum: 2) */
  chains: string[];
  /** Hermes specific configuration */
  config?: Record<string, unknown>;
  /** Hermes specific ports */
  ports?: RelayerPortsConfig;
  /** Hermes specific ICS configuration */
  ics?: { enabled: boolean; consumer: string; provider: string };
}

export interface ExplorerPortsConfig {
  /** Local port for explorer UI */
  rest?: number;
}

export interface ExplorerOutput {
  /** Whether to enable the explorer */
  enabled: boolean;
  /** Type of explorer (currently only 'ping-pub', default: 'ping-pub') */
  type?: 'ping-pub';
  ports?: ExplorerPortsConfig;
  resources?: ResourceConfig;
  /** Override default Docker image for the explorer */
  image?: string;
}

export interface RegistryPortsConfig {
  /** Local port for registry API */
  rest?: number;
}

export interface RegistryOutput {
  /** Whether to enable the registry service */
  enabled: boolean;
  /** Set API endpoints to localhost using chain ports (default: true) */
  localhost?: boolean;
  ports?: RegistryPortsConfig;
  resources?: ResourceConfig;
  /** Override default Docker image for the registry service */
  image?: string;
}
