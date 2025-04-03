import { describe, expect, it } from "vitest";
import {
  type StarshipConfigInput,
  generateStarshipYaml,
} from "./starship-config-gen.js"; // Adjust the import path as necessary

describe("generateStarshipYaml", () => {
  // Helper to normalize YAML for comparison (removes indentation inconsistencies)
  const normalizeYaml = (yaml: string) =>
    yaml
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .join("\n");

  it("should generate a basic YAML config with chains only", () => {
    const input: StarshipConfigInput = {
      configName: "test-ship",
      configVersion: "1.0.0",
      chains: [
        {
          id: "gaia-1",
          name: "gaia",
          numValidators: 1,
          ports: { rest: 1317, rpc: 26657 },
        },
      ],
    };

    const expectedYaml = `name: test-ship
version: 1.0.0
chains:
  - id: gaia-1
    name: gaia
    numValidators: 1
    ports:
      rest: 1317
      rpc: 26657
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include relayers, explorer, and registry when provided", () => {
    const input: StarshipConfigInput = {
      configName: "full-ship",
      configVersion: "1.5.0",
      chains: [
        {
          id: "osmosis-1",
          name: "osmosis",
          numValidators: 2,
          ports: { rest: 1313, rpc: 26653 },
        },
        {
          id: "gaia-1",
          name: "gaia",
          numValidators: 2,
          ports: { rest: 1317, rpc: 26657 },
        },
      ],
      relayers: [
        {
          name: "osmo-gaia",
          type: "hermes",
          replicas: 1,
          chains: ["osmosis-1", "gaia-1"],
        },
      ],
      explorer: {
        enabled: true,
        type: "ping-pub", // Added default type to fix original test
        ports: { rest: 8080 },
      },
      registry: {
        enabled: true,
        localhost: true, // Added default value to fix original test
        ports: { rest: 8081 },
      },
    };

    const expectedYaml = `name: full-ship
version: 1.5.0
chains:
  - id: osmosis-1
    name: osmosis
    numValidators: 2
    ports:
      rest: 1313
      rpc: 26653
  - id: gaia-1
    name: gaia
    numValidators: 2
    ports:
      rest: 1317
      rpc: 26657
relayers:
  - name: osmo-gaia
    type: hermes
    replicas: 1
    chains:
      - osmosis-1
      - gaia-1
explorer:
  enabled: true
  type: ping-pub
  ports:
    rest: 8080
registry:
  enabled: true
  localhost: true
  ports:
    rest: 8081
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should handle missing optional fields gracefully", () => {
    const inputWithDefaultsApplied: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        { id: "juno-1", name: "juno", numValidators: 1 }, // No ports
      ],
    };

    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: juno-1
    name: juno
    numValidators: 1
`;
    const resultYaml = generateStarshipYaml(inputWithDefaultsApplied);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include chain-level optional fields like image, resources, faucet", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "osmosis-custom",
          name: "osmosis",
          numValidators: 1,
          image: "ghcr.io/hyperweb-io/starship/osmosis:v25.0.0",
          resources: { cpu: "0.5", memory: "512M" },
          faucet: {
            enabled: true,
            type: "starship",
            concurrency: 3,
          },
        },
      ],
    };

    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: osmosis-custom
    name: osmosis
    numValidators: 1
    image: ghcr.io/hyperweb-io/starship/osmosis:v25.0.0
    resources:
      cpu: '0.5'
      memory: 512M
    faucet:
      enabled: true
      type: starship
      concurrency: 3
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include custom chain configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "custom-chain-1",
          name: "custom",
          numValidators: 1,
          image: "my/custom-image:latest",
          home: "/root/.customd",
          binary: "customd",
          prefix: "custom",
          denom: "ucustom",
          coins: "1000000000ucustom",
          hdPath: "m/44'/999'/0'/0/0",
          coinType: 999,
          repo: "https://github.com/my/custom-chain",
        },
      ],
    };

    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: custom-chain-1
    name: custom
    numValidators: 1
    image: my/custom-image:latest
    home: /root/.customd
    binary: customd
    prefix: custom
    denom: ucustom
    coins: 1000000000ucustom
    hdPath: m/44'/999'/0'/0/0
    coinType: 999
    repo: https://github.com/my/custom-chain
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include build configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "osmosis-build",
          name: "osmosis",
          numValidators: 1,
          build: {
            enabled: true,
            source: "v15.0.0",
          },
          // Need repo if using build
          repo: "https://github.com/osmosis-labs/osmosis",
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: osmosis-build
    name: osmosis
    numValidators: 1
    repo: https://github.com/osmosis-labs/osmosis
    build:
      enabled: true
      source: v15.0.0
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include upgrade configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "osmosis-upgrade",
          name: "osmosis",
          numValidators: 2,
          upgrade: {
            enabled: true,
            type: "build",
            genesis: "v13.0.0",
            upgrades: [
              { name: "v14", version: "v14.0.0" },
              { name: "v15", version: "v15.0.0-rc1" },
            ],
          },
          // Need repo if using upgrade type build
          repo: "https://github.com/osmosis-labs/osmosis",
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: osmosis-upgrade
    name: osmosis
    numValidators: 2
    repo: https://github.com/osmosis-labs/osmosis
    upgrade:
      enabled: true
      type: build
      genesis: v13.0.0
      upgrades:
        - name: v14
          version: v14.0.0
        - name: v15
          version: v15.0.0-rc1
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include genesis patching configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "osmosis-genesis",
          name: "osmosis",
          numValidators: 1,
          genesis: {
            app_state: {
              staking: {
                params: {
                  unbonding_time: "5s",
                },
              },
            },
          },
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: osmosis-genesis
    name: osmosis
    numValidators: 1
    genesis:
      app_state:
        staking:
          params:
            unbonding_time: 5s
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include chain env variables", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "debug-chain",
          name: "gaia",
          numValidators: 1,
          env: [
            { name: "DEBUG", value: "SwingSet:vat,SwingSet:ls" },
            { name: "ANOTHER_VAR", value: "some_value" },
          ],
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: debug-chain
    name: gaia
    numValidators: 1
    env:
      - name: DEBUG
        value: SwingSet:vat,SwingSet:ls
      - name: ANOTHER_VAR
        value: some_value
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include ICS configuration for chain and relayer", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "neutron-1",
          name: "neutron",
          numValidators: 1,
          ics: {
            enabled: true,
            provider: "cosmoshub-4",
          },
        },
        {
          id: "cosmoshub-4",
          name: "cosmoshub",
          numValidators: 1,
        },
      ],
      relayers: [
        {
          name: "neutron-cosmos",
          type: "hermes",
          replicas: 1,
          chains: ["neutron-1", "cosmoshub-4"],
          ics: {
            enabled: true,
            consumer: "neutron-1",
            provider: "cosmoshub-4",
          },
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: neutron-1
    name: neutron
    numValidators: 1
    ics:
      enabled: true
      provider: cosmoshub-4
  - id: cosmoshub-4
    name: cosmoshub
    numValidators: 1
relayers:
  - name: neutron-cosmos
    type: hermes
    replicas: 1
    chains:
      - neutron-1
      - cosmoshub-4
    ics:
      enabled: true
      consumer: neutron-1
      provider: cosmoshub-4
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include custom balances configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "rich-chain",
          name: "osmosis",
          numValidators: 1,
          balances: [
            {
              address: "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5",
              amount: "100000000000000uosmo",
            },
            {
              address: "osmo1anotheraddress", // Different address example
              amount: "5000000uion",
            },
          ],
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: rich-chain
    name: osmosis
    numValidators: 1
    balances:
      - address: cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5
        amount: 100000000000000uosmo
      - address: osmo1anotheraddress
        amount: 5000000uion
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include Ethereum configuration", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        {
          id: "1337",
          name: "ethereum",
          numValidators: 1,
          ports: { rest: 8545, rpc: 8551 },
          config: {
            beacon: {
              enabled: true,
              image: "ghcr.io/hyperweb-io/starship/prysm/beacon-chain:v5.2.0",
              numValidator: 1,
            },
            validator: {
              enabled: true,
              image: "ghcr.io/hyperweb-io/starship/prysm/validator:v5.2.0",
              numValidator: 1,
            },
            prysmctl: {
              image: "ghcr.io/hyperweb-io/starship/prysm/cmd/prysmctl:v5.2.0",
            },
          },
        },
      ],
    };

    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: '1337'
    name: ethereum
    numValidators: 1
    ports:
      rest: 8545
      rpc: 8551
    config:
      beacon:
        enabled: true
        image: ghcr.io/hyperweb-io/starship/prysm/beacon-chain:v5.2.0
        numValidator: 1
      validator:
        enabled: true
        image: ghcr.io/hyperweb-io/starship/prysm/validator:v5.2.0
        numValidator: 1
      prysmctl:
        image: ghcr.io/hyperweb-io/starship/prysm/cmd/prysmctl:v5.2.0
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });

  it("should include Hermes relayer specific config and ports", () => {
    const input: StarshipConfigInput = {
      configName: "starship",
      configVersion: "1.6.0",
      chains: [
        { id: "chain-a", name: "gaia", numValidators: 1 },
        { id: "chain-b", name: "osmosis", numValidators: 1 },
      ],
      relayers: [
        {
          name: "hermes-custom",
          type: "hermes",
          replicas: 1,
          chains: ["chain-a", "chain-b"],
          ports: {
            rest: 3001,
            exposer: 3002,
          },
          config: {
            global: {
              log_level: "error",
            },
            mode: {
              clients: {
                enabled: true,
              },
            },
            event_source: {
              mode: "pull",
            },
          },
        },
      ],
    };
    const expectedYaml = `name: starship
version: 1.6.0
chains:
  - id: chain-a
    name: gaia
    numValidators: 1
  - id: chain-b
    name: osmosis
    numValidators: 1
relayers:
  - name: hermes-custom
    type: hermes
    replicas: 1
    chains:
      - chain-a
      - chain-b
    config:
      global:
        log_level: error
      mode:
        clients:
          enabled: true
      event_source:
        mode: pull
    ports:
      rest: 3001
      exposer: 3002
`;
    const resultYaml = generateStarshipYaml(input);
    expect(normalizeYaml(resultYaml)).toEqual(normalizeYaml(expectedYaml));
  });
});
