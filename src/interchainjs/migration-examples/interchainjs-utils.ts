import { parseCoins } from "@interchainjs/amino";
import { fromBech32, toBech32 } from "@interchainjs/encoding";
import { Decimal, Uint53 } from "@interchainjs/math";

// Example 1: Bech32 encoding and decoding
const decodedAddress = fromBech32(
	"cosmos1zmj0fpkm9px3f7klg7hzycu6z6k76jskvnsc0n",
);
console.log("Decoded Address Prefix:", decodedAddress.prefix);
console.log("Decoded Address Data Length:", decodedAddress.data.length);

const reEncodedAddress = toBech32("cosmos", decodedAddress.data);
console.log("Re-encoded Address:", reEncodedAddress);

// Example 2: Parsing coin strings
const coinsString = "1000000uatom,500000stake";
const parsedCoins = parseCoins(coinsString);
console.log("Parsed Coins:", parsedCoins);

const singleCoinString = "12345uosmo";
const parsedCoin = parseCoins(singleCoinString)[0];
console.log("Parsed Single Coin:", parsedCoin);

// Example 3: Using Decimal for calculations
const amount1 = Decimal.fromUserInput("123.456", 6); // Represents 123.456000
const amount2 = Decimal.fromUserInput("0.001", 6); // Represents 0.001000

const sum = amount1.plus(amount2);
console.log(
	`Sum: ${sum.toString()} (fractional digits: ${sum.fractionalDigits})`,
);

const product = amount1.multiply(new Uint53(2)); // Multiply by 2
console.log(
	`Product: ${product.toString()} (fractional digits: ${product.fractionalDigits})`,
);

const division = amount1.toFloatApproximation() / 10;
console.log(`Division (approx float): ${division}`);
