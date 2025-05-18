# How to update Interchainjs snippets

## Snippets files

- `_custom.txt` - Manually created snippets
- `_generated.txt` - Auto-generated snippets from [Context 7](https://context7.com/hyperweb-io/interchainjs)
- `common.txt` - Common snippets for all networks
- `cosmos.txt` - Cosmos-specific snippets
- `injective.txt` - Injective-specific snippets
- `ethereum.txt` - Ethereum-specific snippets

## Steps to update snippets

1. Go to [Context 7](https://context7.com/hyperweb-io/interchainjs) and update the snippets
2. Copy the snippets and paste them into the `_generated.txt` file
3. Create snippets from other sources (e.g. examples in CIA) and paste them into the `_custom.txt` file
4. Run `pnpm categorize-snippets` to categorize the snippets into the appropriate files
