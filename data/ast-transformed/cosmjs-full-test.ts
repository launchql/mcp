import { fromBech32, toBech32 } from "@interchainjs/encoding";
import { Decimal, Uint53 } from "@interchainjs/math";
import { Secp256k1HDWallet } from "@interchainjs/cosmos/wallets/secp256k1hd";
import { GasPrice, SigningStargateClient, calculateFee, parseCoins, } from "@cosmjs/stargate";
import type { StdFee } from "@interchainjs/cosmos";
import type { MsgSend } from "interchainjs/cosmos/bank/v1beta1/tx";
// ---- Types and Interfaces ----
interface TransactionConfig {
    rpcEndpoint: string;
    gasPrice: string;
    gasLimit: number;
    memo?: string;
}
interface SendTokensParams {
    recipientAddress: string;
    amount: {
        denom: string;
        amount: string;
    };
}
// ---- Address Utilities ----
export function handleBech32Address(address: string): {
    decodedAddress: {
        prefix: string;
        data: Uint8Array;
    };
    reEncodedAddress: string;
} {
    const decodedAddress = fromBech32(address);
    const reEncodedAddress = toBech32(decodedAddress.prefix, decodedAddress.data);
    return {
        decodedAddress,
        reEncodedAddress,
    };
}
// ---- Coin Utilities ----
export function parseCoinStrings(coinString: string) {
    try {
        const parsed = parseCoins(coinString);
        return {
            success: true,
            coins: parsed,
            total: parsed.reduce((acc, coin) => acc + Number(coin.amount), 0),
        };
    }
    catch (error) {
        return {
            success: false,
            error: `Failed to parse coin string: ${error.message}`,
            coins: [],
            total: 0,
        };
    }
}
// ---- Decimal Calculation Utilities ----
export namespace DecimalCalculator {
    export function add(amount1: string, amount2: string, precision = 6): string {
        const dec1 = Decimal.fromUserInput(amount1, precision);
        const dec2 = Decimal.fromUserInput(amount2, precision);
        return dec1.plus(dec2).toString();
    }
    export function multiply(amount: string, multiplier: number, precision = 6): string {
        const dec = Decimal.fromUserInput(amount, precision);
        return dec.multiply(new Uint53(multiplier)).toString();
    }
    export function divide(amount: string, divisor: number, precision = 6): number {
        const dec = Decimal.fromUserInput(amount, precision);
        return dec.toFloatApproximation() / divisor;
    }
}
// ---- Transaction Management ----
export class CosmosTransactionManager {
    private config: TransactionConfig;
    private signer?: DirectSecp256k1HdWallet;
    private client?: SigningStargateClient;
    constructor(config: TransactionConfig) {
        this.config = {
            ...config,
            memo: config.memo || "Transaction via CosmJS",
        };
    }
    async initialize(mnemonic: string, prefix = "cosmos") {
        try {
            this.signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix,
            });
            this.client = await SigningClient.connectWithSigner(this.config.rpcEndpoint, this.signer, {
                broadcast: { checkTx: true, deliverTx: true }
            });
            return true;
        }
        catch (error) {
            console.error("Failed to initialize transaction manager:", error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }
    private calculateTransactionFee(): StdFee {
        const gasPrice = GasPrice.fromString(this.config.gasPrice);
        return calculateFee(this.config.gasLimit, gasPrice);
    }
    async sendTokens(params: SendTokensParams) {
        if (!this.signer || !this.client) {
            throw new Error("Transaction manager not initialized");
        }
        try {
            const [account] = await this.signer.getAccounts();
            const senderAddress = account.address;
            const message: MsgSend = {
                fromAddress: senderAddress,
                toAddress: params.recipientAddress,
                amount: [params.amount],
            };
            const msgAny = {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                value: message,
            };
            const fee = this.calculateTransactionFee();
            const result = await this.client.signAndBroadcast(senderAddress, [msgAny], fee, this.config.memo);
            return {
                success: true,
                hash: result.transactionHash,
                details: result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
// ---- Example Usage ----
async function demonstrateFeatures() {
    // Address handling example
    const addressResult = handleBech32Address("cosmos1zmj0fpkm9px3f7klg7hzycu6z6k76jskvnsc0n");
    console.log("Address handling result:", addressResult);
    // Coin parsing example
    const coinResult = parseCoinStrings("1000000uatom,500000stake");
    console.log("Coin parsing result:", coinResult);
    // Decimal calculations
    const sum = DecimalCalculator.add("123.456", "0.001");
    const product = DecimalCalculator.multiply("123.456", 2);
    const quotient = DecimalCalculator.divide("123.456", 10);
    console.log("Calculations:", { sum, product, quotient });
    // Transaction example
    const manager = new CosmosTransactionManager({
        rpcEndpoint: "rpc.cosmos.network:26657",
        gasPrice: "0.025uatom",
        gasLimit: 200000,
    });
    try {
        await manager.initialize("your-mnemonic-here");
        const result = await manager.sendTokens({
            recipientAddress: "cosmos1...",
            amount: {
                denom: "uatom",
                amount: "1000",
            },
        });
        console.log("Transaction result:", result);
    }
    catch (error) {
        console.error("Transaction failed:", error);
    }
}
// Uncomment to run all examples:
// demonstrateFeatures();
