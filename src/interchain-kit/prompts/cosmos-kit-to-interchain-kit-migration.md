# CosmosKit to InterchainKit Migration Guide

## Persona

You are an expert React/TypeScript developer experienced in building decentralized applications (dApps) on the Cosmos ecosystem. You are familiar with wallet connection libraries like CosmosKit and are looking to migrate to the newer InterchainKit.

## Objective

Migrate a React application currently using `CosmosKit` (v2) for wallet connections and interactions to its functional equivalent using the beta version of `InterchainKit`. This involves updating package dependencies, replacing the provider component, migrating hooks, and adjusting configuration.

## Key Differences & API Mappings

| Feature          | CosmosKit (`@cosmos-kit/react` or `react-lite`)                                                                             | InterchainKit (Beta) (`@interchain-kit/react`)                                                     | Notes                                                                                                 |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Core Package** | `@cosmos-kit/react` or `@cosmos-kit/react-lite`                                                                             | `@interchain-kit/react`                                                                            | Main React integration package.                                                                       |
| **Provider**     | `ChainProvider`                                                                                                             | `InterchainProvider`                                                                               | Wraps the application to provide context.                                                             |
| **Chains Data**  | `chains` from `chain-registry`                                                                                              | `chains` from `chain-registry`                                                                     | Same source, passed as prop.                                                                          |
| **Assets Data**  | `assetLists` from `chain-registry`                                                                                          | `assets` from `@chain-registry/client`                                                             | Different source package (`@chain-registry/client` likely needed). Passed as `assetLists` prop.       |
| **Wallets**      | `wallets` array (e.g., `import { wallets } from '@cosmos-kit/keplr'`)                                                       | `wallets` array (e.g., `import { KeplrWallet } from '@interchain-kit/keplr'`)                      | Wallet imports come from different packages (e.g., `@interchain-kit/keplr`). Structure seems similar. |
| **Connect Hook** | `useChain(chainName)` returns `connect`, `disconnect`, `status`, `address`, `username`, `wallet`, etc.                      | `useConnectModal()`, `useConnect()`, `useDisconnect()`, `useWallet()`                              | Functionality split into multiple hooks. `useWallet()` provides connection status and address.        |
| **Manager Hook** | `useManager()`                                                                                                              | `useWalletManager()`                                                                               | Provides access to wallet management state and actions.                                               |
| **Client Hook**  | `useWalletClient()`                                                                                                         | `useSigningCosmWasmClient()`, `useStargateClient()`                                                | Hooks for getting specific CosmJS clients.                                                            |
| **Modal**        | Default modal in `@cosmos-kit/react`, customizable via `walletModal` / `modalViews`. `@cosmos-kit/react-lite` has no modal. | Default modal provided. Customization options might differ (check InterchainKit docs for details). | InterchainKit seems to bundle a default modal experience.                                             |
| **Styling**      | `@interchain-ui/react/styles`                                                                                               | `@interchain-kit/react/styles`                                                                     | Import path for necessary base styles.                                                                |

## Missing or Different Features in InterchainKit (Beta)

InterchainKit is currently in Beta, and while it aims to provide a modern alternative to CosmosKit, some features might be missing, implemented differently, or less mature:

1.  **Fewer Hooks:** InterchainKit appears to have a more focused set of hooks compared to CosmosKit's broader range (`useChains`, `useChainWallet`, `useIframe`, `useModalTheme`, `useNameService`). Functionality might be consolidated or require different approaches.
2.  **Name Service (`useNameService`):** There is no direct equivalent mentioned in the InterchainKit Beta documentation. Name service resolution might need manual implementation or rely on other libraries.
3.  **Wallet Support:** While key wallets like Keplr are supported, the _range_ of wallets integrated might be smaller than CosmosKit's extensive list during the Beta phase. Verify if all wallets used in your project are available for InterchainKit.
4.  **Modal Customization:** The exact mechanisms and extent of modal customization (`walletModal`, `modalViews` equivalents) in InterchainKit might differ from CosmosKit. Review InterchainKit documentation for customization capabilities.
5.  **`useChain` Hook Equivalent:** The `useChain(chainName)` hook in CosmosKit provides a convenient, chain-specific context. InterchainKit seems to rely on more general hooks (`useWallet`, `useConnect`, etc.) combined with the chain name or ID where needed. Managing state for multiple connected chains might require a different pattern.
6.  **Advanced Configuration:** Options available in CosmosKit's `ChainProvider` (like `sessionOptions`, `signerOptions`, `endpointOptions`, `walletConnectOptions`, `modalOptions`) may have different names, structures, or might not all be present in InterchainKit's `InterchainProvider`. Check the `InterchainProvider` props documentation carefully.
7.  **WalletConnect Integration:** Specific details and configuration options (`walletConnectOptions`) for WalletConnect might differ.

## Migration Steps

### Step 1: Update Dependencies

1.  **Remove CosmosKit Packages:**
    Identify all `@cosmos-kit/*` packages and `chain-registry` in your `package.json`.

    ```bash
    # Example using yarn (adapt for npm/pnpm)
    yarn remove @cosmos-kit/react @cosmos-kit/keplr @cosmos-kit/core chain-registry # ... other cosmos-kit wallets
    ```

2.  **Install InterchainKit Packages:**
    Install the core InterchainKit package, necessary wallet packages, and the new assets package.
    ```bash
    # Example using yarn (adapt for npm/pnpm)
    yarn add @interchain-kit/react @interchain-kit/keplr @chain-registry/client # ... other interchain-kit wallets
    ```
    _Note: You will likely still need `chain-registry` for the `chains` data._ Check if InterchainKit re-exports it or if you need to add it back. Assume `chain-registry` is needed for now.\*
    ```bash
    # Example using yarn (adapt for npm/pnpm)
    yarn add chain-registry
    ```

### Step 2: Update Provider Setup

Locate the file where `ChainProvider` is used (often `_app.tsx` or `main.tsx`).

**CosmosKit:**

```typescript
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets as assetLists } from 'chain-registry'; // Asset import might vary
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
// ... other wallet imports

// Import styles
import '@interchain-ui/react/styles';

function App() {
  return (
    <ChainProvider
      chains={chains}
      assetLists={assetLists} // Or however assets were previously sourced
      wallets={[...keplrWallets /* ... other wallets */]}
      // ... other options like walletConnectOptions, signerOptions etc.
    >
      {/* Rest of the app */}
    </ChainProvider>
  );
}
```

**InterchainKit:**

```typescript
import { InterchainProvider } from '@interchain-kit/react';
import { chains } from 'chain-registry';
import { assets as assetLists } from '@chain-registry/client'; // Updated assets import
import { KeplrWallet } from '@interchain-kit/keplr'; // Updated wallet import
// ... other wallet imports

// Import styles
import '@interchain-kit/react/styles'; // Updated style import

function App() {
  return (
    <InterchainProvider
      chains={chains}
      assetLists={assetLists}
      wallets={[new KeplrWallet(/* options */) /* ... other wallets */]}
      // ... map relevant CosmosKit options to InterchainProvider props if available
    >
      {/* Rest of the app */}
    </InterchainProvider>
  );
}
```

_Key Changes:_ - Replace `ChainProvider` with `InterchainProvider`. - Update import paths for styles, assets (`@chain-registry/client`), and wallets (`@interchain-kit/*`). - Wallet instances might need explicit instantiation (`new KeplrWallet()`). - Review and map `ChainProvider` props (`walletConnectOptions`, `signerOptions`, etc.) to their corresponding props in `InterchainProvider` if they exist. Consult InterchainKit documentation for available props.

### Step 3: Migrate Hooks

Search your codebase for hooks imported from `@cosmos-kit/react` or `@cosmos-kit/react-lite`.

**Example: Migrating Connection Logic (`useChain`)**

**CosmosKit:**

```typescript
import { useChain } from '@cosmos-kit/react';

function WalletConnectButton({ chainName = 'cosmoshub' }) {
  const { connect, disconnect, status, address, username, openView } = useChain(chainName);

  if (status === 'Connected') {
    return (
      <div>
        <p>Connected as {username || address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={() => connect()}>Connect Wallet</button>;
  // Or use openView() for modal control
}
```

**InterchainKit:**

```typescript
import { useConnectModal, useConnect, useDisconnect, useWallet } from '@interchain-kit/react';

function WalletConnectButton({ chainName = 'cosmoshub' }) {
  const { status, address, chain } = useWallet(chainName); // Or useWallet() for default chain
  const { open } = useConnectModal();
  const { connect } = useConnect(); // Might not be needed if using modal
  const { disconnect } = useDisconnect();

  if (status === 'Connected' && chain?.chain_name === chainName) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  // Preferred way: Use the modal
  return <button onClick={open}>Connect Wallet</button>;

  // Alternative (direct connect, less common):
  // return <button onClick={() => connect(chainName)}>Connect Wallet</button>;
}
```

_Key Changes:_ - Replace `useChain` with a combination of `useWallet`, `useConnectModal`, `useConnect`, `useDisconnect`. - `useWallet` provides `status`, `address`, `chain`. Check if the connected `chain.chain_name` matches the desired one if managing multiple chains. - Use `useConnectModal().open` to trigger the connection flow. Direct `connect()` might be available but the modal is standard. - `username` might not be directly available; check `useWallet` return type.

**Example: Migrating Client Usage (`useWalletClient`)**

**CosmosKit:**

```typescript
import { useWalletClient } from '@cosmos-kit/react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

function MyComponent({ chainName = 'osmosis' }) {
  const { client } = useWalletClient(chainName);

  async function doSomething() {
    if (!client || !(client instanceof SigningCosmWasmClient)) {
      console.error('Need SigningCosmWasmClient');
      return;
    }
    // Use client
  }
  // ...
}
```

**InterchainKit:**

```typescript
import { useSigningCosmWasmClient } from '@interchain-kit/react';

function MyComponent({ chainName = 'osmosis' }) {
  const { data: client } = useSigningCosmWasmClient(chainName); // Pass chainName if needed

  async function doSomething() {
    if (!client) {
      console.error('Client not available');
      return;
    }
    // Use client
  }
  // ...
}
```

_Key Changes:_ - Replace `useWalletClient` with the specific client hook needed (e.g., `useSigningCosmWasmClient`, `useStargateClient`). - Access the client via the `data` property of the hook's return value.

**Repeat this process for all other CosmosKit hooks (`useManager`, etc.), finding their InterchainKit equivalents (`useWalletManager`, etc.) and adapting the usage.**

### Step 4: Review and Test

- Thoroughly test all wallet connection flows, disconnections, transaction signing, and querying functionalities.
- Pay close attention to multi-chain interactions if your application supports them.
- Verify the behavior of the connection modal.
- Check for console errors or warnings.

## Additional InterchainKit Code Examples (React)

Here are some more examples demonstrating common InterchainKit patterns:

**1. Provider Setup with All Mainnet Chains:**

This shows how to easily include all mainnet chains and assets from the `@chain-registry/v2` package.

```typescript
import { ChainProvider, useChain } from "@interchain-kit/react";
import { keplrWallet } from "@interchain-kit/keplr-extension"; // Assuming keplr extension
import { ThemeProvider } from "@interchain-ui/react"; // For UI components
import { chains, assetLists } from '@chain-registry/v2/mainnet';

import "@interchain-ui/react/styles"; // Import styles

const DisplayAddress = () => {
  // Example: Get address for osmosis
  const { address } = useChain('osmosis');
  return <div>Osmosis Address: {address || \'Not Connected\'}</div>;
};

function App() {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={chains}
        assetLists={assetLists}
        wallets={[keplrWallet]} // Use the imported wallet object
        // Add signerOptions and endpointOptions if needed
        // signerOptions={{}}
        // endpointOptions={{}}
      >
        <DisplayAddress />
        {/* Add connect/disconnect buttons and other components */}
      </ChainProvider>
    </ThemeProvider>
  );
}

export default App;
```

**2. Basic `useChain` Hook Usage:**

Retrieve various details and functions for a specific chain.

```typescript
import { useChain } from '@interchain-kit/react';

const chainName = 'cosmoshub';
const {
  chain, // Chain info for cosmoshub
  assetList, // Assets info for cosmoshub
  address, // User's address for cosmoshub (string when connected, undefined otherwise)
  wallet, // Info about the connected wallet (e.g., Keplr)
  connect, // Function to connect the wallet
  disconnect, // Function to disconnect the wallet
  getRpcEndpoint, // Function to get RPC endpoint: () => Promise<string | HttpEndpoint>
  getSigningClient, // Function to get a signing client: () => Promise<SigningClient>
  message, // Connection status message
  openView, // Function to open modal views
} = useChain(chainName);

// Example: Log address if connected
if (address) {
  console.log(`Connected to ${chainName} with address: ${address}`);
}
```

**3. Accessing Wallet Methods:**

Get the wallet object via `useChain` and call its methods.

```typescript
import { useChain } from '@interchain-kit/react';
// Assuming necessary types like StdSignDoc are imported

async function signSomething() {
  const { wallet, address: signAddress, chain } = useChain('osmosis');

  if (wallet && signAddress && chain) {
    try {
      // Example: Sign Amino (replace stdDoc with actual sign doc)
      // const stdDoc: StdSignDoc = { ... };
      // const signature = await wallet.signAmino(chain.chain_id, signAddress, stdDoc);
      // console.log('Amino Signature:', signature);

      // Example: Verify Arbitrary (replace message with actual data)
      // const message = 'Verify this message';
      // const verifyResult = await wallet.verifyArbitrary(chain.chain_id, signAddress, message);
      // console.log('Verification Result:', verifyResult);

      console.log('Wallet methods available.'); // Placeholder
    } catch (error) {
      console.error('Error using wallet methods:', error);
    }
  } else {
    console.log('Wallet not connected or details missing.');
  }
}
```

**4. Configuring Multiple Wallets:**

Set up `ChainProvider` to support multiple wallet extensions.

```typescript
import { ChainProvider } from '@interchain-kit/react';
import { chains } from 'chain-registry'; // Or specific chains
import { assets as assetLists } from '@chain-registry/client';
import { ThemeProvider } from '@interchain-ui/react';

// Import wallet integrations
import { keplrExtensionInfo, keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension'; // Example

import '@interchain-ui/react/styles';

// Optionally export names for reference
export const keplrWalletName = keplrExtensionInfo.name;

function App() {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={chains} // Provide desired chains
        assetLists={assetLists} // Provide corresponding asset lists
        wallets={[
          keplrWallet, // Add Keplr
          leapWallet, // Add Leap
          // Add other imported wallets here
        ]}
      >
        {/* App Components */}
      </ChainProvider>
    </ThemeProvider>
  );
}

export default App;
```

## Important Considerations

- **Beta Software:** InterchainKit is in Beta. Expect potential API changes, bugs, or missing features compared to the more established CosmosKit.
- **UI Differences:** If you were using the default modal from `@cosmos-kit/react`, the look and feel of the InterchainKit modal will likely be different. Adjust custom UI elements accordingly.
- **Error Handling:** Review how errors are exposed and handled in InterchainKit hooks compared to CosmosKit.
- **State Management:** The way connection state and wallet information are managed might differ. Adapt your application's state logic if necessary.
- **Documentation:** Refer frequently to the official InterchainKit (Beta) documentation for detailed API specifications, configuration options, and examples.
