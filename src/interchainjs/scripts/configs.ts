export interface InputFile {
  path: string;
  snippetsDelimiter: string;
  matchingRule: 'path' | 'keyword';
}

export const inputFiles: InputFile[] = [
  {
    path: 'src/interchainjs/prompts/snippets/_generated.txt',
    snippetsDelimiter: '\n\n----------------------------------------\n\n',
    matchingRule: 'path',
  },
  {
    path: 'src/interchainjs/prompts/snippets/_custom.txt',
    snippetsDelimiter: '\n\n----------------------------------------\n\n',
    matchingRule: 'keyword',
  },
];

export interface OutputFile {
  path: string;
  matchingPaths: string[]; // regex patterns to match the SOURCE path of the snippet
  matchingKeyword: 'common' | 'cosmos' | 'injective' | 'ethereum';
}

export const outputFiles: OutputFile[] = [
  {
    path: 'src/interchainjs/prompts/snippets/common.txt',
    matchingPaths: ['.*/docs/.*', '.*/packages/.*'],
    matchingKeyword: 'common',
  },
  {
    path: 'src/interchainjs/prompts/snippets/cosmos.txt',
    matchingPaths: [
      '.*/networks/cosmos/.*',
      '.*/libs/cosmos-types/.*',
      '.*/libs/interchain-react/.*',
      '.*/libs/interchain-vue/.*',
      '.*/libs/interchainjs/.*',
    ],
    matchingKeyword: 'cosmos',
  },
  {
    path: 'src/interchainjs/prompts/snippets/injective.txt',
    matchingPaths: [
      '.*/networks/injective/.*',
      '.*/libs/injective-react/.*',
      '.*/libs/injective-vue/.*',
      '.*/libs/injectivejs/.*',
    ],
    matchingKeyword: 'injective',
  },
  {
    path: 'src/interchainjs/prompts/snippets/ethereum.txt',
    matchingPaths: ['.*/networks/ethereum/.*'],
    matchingKeyword: 'ethereum',
  },
];
