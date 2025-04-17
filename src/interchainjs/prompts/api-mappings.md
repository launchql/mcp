### Client Instantiation

```typescript
// CosmJS
import { SigningStargateClient } from '@cosmjs/stargate';
const signingClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, signer);

// InterchainJS
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { DirectGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet'; // Often needs wrapping
// Example with DirectSecp256k1HdWallet signer
const genericSigner = new DirectGenericOfflineSigner(offlineSigner);
const signingClient = await SigningClient.connectWithSigner(rpcEndpoint, genericSigner);
```

### Fee Calculation

```typescript
// CosmJS
import { calculateFee, GasPrice } from '@cosmjs/stargate';
const gasPrice = GasPrice.fromString('0.025uatom');
const fee = calculateFee(100000, gasPrice); // Uses calculateFee

// InterchainJS
import { StdFee } from '@interchainjs/amino'; // Import the type if needed
// Often defined directly as an object literal matching the Fee structure:
const fee: StdFee = {
  amount: [{ denom: 'uatom', amount: '5000' }],
  gas: '200000',
};
```

### Type Differences

```typescript
// CosmJS
import { StdFee } from '@cosmjs/stargate';
import type { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

// InterchainJS
import { StdFee } from '@interchainjs/amino'; // Centralized types package
import type { MsgSend } from 'interchainjs/cosmos/bank/v1beta1/tx'; // Types often generated
// Note: Message type imports and structures might differ significantly.
```

### Signing and Broadcasting

```typescript
// CosmJS
// Uses a generic signAndBroadcast method on the client
const result = await signingClient.signAndBroadcast(senderAddress, [msgAny], fee, memo);

// InterchainJS
// Often uses specific, generated functions for each message type
//
// Import path format: interchainjs/cosmos/<module>/<version>/<fileName>
// - `module`: The module name (e.g., 'bank', 'gov', 'staking', etc.)
// - `version`: The version of the module, usually `v1beta1`
// - `fileName`: The filenames for this module, it can be one of the following:
//   - `tx.rpc.func.ts` for transaction methods, e.g. `send`, `multiSend`, `updateParams`, `setSendEnabled`
//   - `tx.ts` for types of transaction methods, e.g. `MsgSend`, `MsgMultiSend`, `MsgUpdateParams`, `MsgSetSendEnabled`
//   - `query.rpc.func.ts` for query methods, it always has the `get` prefix, e.g. `getBalance`, `getAllBalances`, `getDenomMetadata` `getParams`
//   - `query.ts` for types of query methods, e.g. `QueryBalanceRequest`, `QueryBalanceResponse`, `QueryAllBalancesRequest`, `QueryAllBalancesResponse`
//   - `<module>.ts` (e.g. `bank.ts`) for constants and utils of this module
//
// More examples:
// - `import { delegate } from 'interchainjs/cosmos/staking/v1beta1/tx.rpc.func';`
// - `import { MsgDelegate } from 'interchainjs/cosmos/staking/v1beta1/tx';`
// - `import { getDelegation } from 'interchainjs/cosmos/staking/v1beta1/query.rpc.func';`
// - `import { QueryDelegationRequest, QueryDelegationResponse } from 'interchainjs/cosmos/staking/v1beta1/query';`
// - `import { BondStatus } from 'interchainjs/cosmos/staking/v1beta1/staking.ts';`
import { send } from 'interchainjs/cosmos/bank/v1beta1/tx.rpc.func';
const result = await send(signingClient, senderAddress, msgPayload, fee, memo); // Call the specific function
```

**Note: Differences between `@interchainjs/cosmos` and `interchainjs`**

- `@interchainjs/cosmos` is for signers, wallets and signing clients.
- `interchainjs` is for transaction methods, query methods, types, constants and utils of all modules.

### Packages Differences

Comparison symbol meanings:

- `>`: The package is a superset of the other package.
- `=`: The package is the same as the other package.
- `<`: The package is a subset of the other package.
- `~`: The package is similar to the other package.

#### `@cosmjs/amino` = `@interchainjs/amino`

All imports from `@cosmjs/amino` can be replaced with `@interchainjs/amino`:

```typescript
// CosmJS
import {
  KdfConfiguration,
  SinglePubkey,
  StdSignDoc,
  encodeBech32Pubkey,
  // ...
} from '@cosmjs/amino';

// InterchainJS
import {
  KdfConfiguration,
  SinglePubkey,
  StdSignDoc,
  encodeBech32Pubkey,
  // ...
} from '@interchainjs/amino';
```

#### `@cosmjs/crypto` = `@interchainjs/crypto`

All imports from `@cosmjs/crypto` can be replaced with `@interchainjs/crypto`:

```typescript
// CosmJS
import {
  Argon2id,
  HdPath,
  Sha256,
  Slip10Result,
  // ...
} from '@cosmjs/crypto';

// InterchainJS
import {
  Argon2id,
  HdPath,
  Sha256,
  Slip10Result,
  // ...
} from '@interchainjs/crypto';
```

#### `@cosmjs/encoding` = `@interchainjs/encoding`

All imports from `@cosmjs/encoding` can be replaced with `@interchainjs/encoding` :

```typescript
// CosmJS
import {
  fromAscii,
  fromBech32,
  toUtf8,
  // ...
} from '@cosmjs/encoding';

// InterchainJS
import {
  fromAscii,
  fromBech32,
  toUtf8,
  // ...
} from '@interchainjs/encoding';
```

#### `@cosmjs/math` = `@interchainjs/math`

All imports from `@cosmjs/math` can be replaced with `@interchainjs/math`:

```typescript
// CosmJS
import {
  Decimal,
  Int53,
  Uint32,
  // ...
} from '@cosmjs/math';

// InterchainJS
import {
  Decimal,
  Int53,
  Uint32,
  // ...
} from '@interchainjs/math';
```

#### `@cosmjs/proto-signing` > `@interchainjs/pubkey`

Only the `pubkey` related imports which are 4 functions as shown below from `@cosmjs/proto-signing` can be replaced with `@interchainjs/pubkey`:

```typescript
// CosmJS
import {
  anyToSinglePubkey, // ✅
  decodeOptionalPubkey, // ✅
  decodePubkey, // ✅
  encodePubkey, // ✅
  makeSignDoc, // ❌
  // ...
} from '@cosmjs/proto-signing';

// InterchainJS
import {
  anyToSinglePubkey,
  decodeOptionalPubkey,
  decodePubkey,
  encodePubkey,
  // ...
} from '@interchainjs/pubkey';
```

#### `@cosmjs/utils` ~ `@interchainjs/utils`

Some of the functions from `@cosmjs/utils` can be replaced with `@interchainjs/utils`:

```typescript
// CosmJS
import { arrayContentStartsWith } from '@cosmjs/utils';

// InterchainJS
import { startsWithArray } from '@interchainjs/utils';
```

```typescript
// CosmJS
import { isNonNullObject } from '@cosmjs/utils';

// InterchainJS
import { isObjectLike } from '@interchainjs/utils';
```

```typescript
// CosmJS
import { assert, sleep, isUint8Array } from '@cosmjs/utils';

// InterchainJS
import { assert, sleep, isUint8Array } from '@interchainjs/utils';
```

#### `@cosmjs/stargate` ~ `@interchainjs/utils`

Only the `Attribute` and `Event` imports from `@cosmjs/stargate` can be replaced with `@interchainjs/utils`:

```typescript
// CosmJS
import { Attribute, Event } from '@cosmjs/stargate';

// InterchainJS
import { Attribute, Event } from '@interchainjs/utils';
```

All the methods on `logs` from `@cosmjs/stargate` can be replaced with direct imports from `@interchainjs/utils`:

```typescript
// CosmJS
import { logs } from '@cosmjs/stargate';

// InterchainJS
import {
  parseAttribute,
  parseEvent,
  parseLog,
  parseLogs,
  parseRawLog,
  findAttribute,
  type Log,
} from '@interchainjs/utils';
```

#### `@cosmjs/stargate` ~ `@interchainjs/cosmos`

Only some imports from `@cosmjs/stargate` can be replaced with `@interchainjs/cosmos`:

```typescript
// CosmJS
import {
  assertIsDeliverTxFailure,
  assertIsDeliverTxSuccess,
  isDeliverTxFailure,
  isDeliverTxSuccess,
} from '@cosmjs/stargate';

// InterchainJS
import {
  assertIsDeliverTxFailure,
  assertIsDeliverTxSuccess,
  isDeliverTxFailure,
  isDeliverTxSuccess,
} from '@interchainjs/cosmos/utils';
```

#### `@cosmjs/stargate` ~ `@interchainjs/types`

Only the `DeliverTxResponse` import from `@cosmjs/stargate` can be replaced with `@interchainjs/types`:

```typescript
// CosmJS
import { DeliverTxResponse } from '@cosmjs/stargate';

// InterchainJS
import { DeliverTxResponse } from '@interchainjs/types';
```

#### `@cosmjs/stargate` / `@cosmjs/proto-signing` ~ `@interchainjs/amino`

Only the `Coin`, `coin`, `coins`, `parseCoins` imports from `@cosmjs/stargate` and `@cosmjs/proto-signing` can be replaced with `@interchainjs/amino`:

```typescript
// CosmJS
import { Coin, coin, coins, parseCoins } from '@cosmjs/stargate';
import { Coin, coin, coins, parseCoins } from '@cosmjs/proto-signing';

// InterchainJS
import { Coin, coin, coins, parseCoins } from '@interchainjs/amino';
```

#### `cosmjs-types` ~ `@interchainjs/cosmos-types`

Only the query types from `cosmjs-types` can be replaced with `@interchainjs/cosmos-types`, and only works for a few modules (auth, bank, gov, staking, etc.).

```typescript
// CosmJS
import { QueryBalanceRequest } from 'cosmjs-types/cosmos/bank/v1beta1/query';

// InterchainJS
import { QueryBalanceRequest } from '@interchainjs/cosmos-types/cosmos/bank/v1beta1/query';
```

**Note**

- Prefer using `interchainjs/cosmos/...` over `@interchainjs/cosmos-types` for the types.
