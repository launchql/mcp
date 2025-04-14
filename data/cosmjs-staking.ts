import { AccountData, OfflineSigner } from "@cosmjs/proto-signing";
import {
  DeliverTxResponse,
  GasPrice,
  SigningStargateClient,
  StdFee,
  assertIsDeliverTxSuccess,
  calculateFee,
} from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";

// --- Configuration ---
const RPC_ENDPOINT = "https://rpc.testnet.cosmos.network";
const DEFAULT_GAS_PRICE = "0.025uatom";
const DEFAULT_GAS_LIMIT_DELEGATE = 200000;
const DEFAULT_DENOM = "uatom";

// --- Placeholder ---
declare const signer: OfflineSigner;

interface StakingServiceConfig {
  rpcEndpoint: string;
  signer: OfflineSigner;
  gasPrice: string;
}

class StakingService {
  private client: SigningStargateClient | null = null;
  private signer: OfflineSigner;
  private account: AccountData | null = null;
  private config: StakingServiceConfig;

  constructor(config: StakingServiceConfig) {
    this.config = config;
    this.signer = config.signer;
  }

  public async connect(): Promise<void> {
    assert(this.config.rpcEndpoint, "RPC endpoint is required for connection.");
    assert(this.signer, "Signer is required for connection.");

    console.log(`Connecting to ${this.config.rpcEndpoint}...`);
    this.client = await SigningStargateClient.connectWithSigner(
      this.config.rpcEndpoint,
      this.signer,
    );
    console.log("Stargate client connected.");

    const accounts = await this.signer.getAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts found for the signer.");
    }
    this.account = accounts[0];
    console.log(`Using account: ${this.account.address}`);
  }

  public isConnected(): boolean {
    return !!this.client && !!this.account;
  }

  public async delegate(
    validatorAddress: string,
    amount: string,
    denom: string = DEFAULT_DENOM,
    memo?: string,
  ): Promise<DeliverTxResponse> {
    if (!this.client || !this.account) {
      throw new Error("Service not connected. Call connect() first.");
    }
    assert(
      validatorAddress,
      "Validator address must be provided for delegation.",
    );

    const delegationAmount: Coin = {
      denom: denom,
      amount: amount,
    };

    const msg: MsgDelegate = {
      delegatorAddress: this.account.address,
      validatorAddress: validatorAddress,
      amount: delegationAmount,
    };

    const msgAny: Any = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: MsgDelegate.encode(msg).finish(),
    };

    const gasPrice = GasPrice.fromString(this.config.gasPrice);
    const fee: StdFee = calculateFee(DEFAULT_GAS_LIMIT_DELEGATE, gasPrice);
    const finalMemo = memo || `Delegate ${amount}${denom} via StakingService`;

    console.log(
      `Attempting to delegate ${amount}${denom} to ${validatorAddress}...`,
    );
    console.log("Fee:", fee);
    console.log("Memo:", finalMemo);

    const result = await this.client.signAndBroadcast(
      this.account.address,
      [msgAny],
      fee,
      finalMemo,
    );

    assertIsDeliverTxSuccess(result);
    console.log("Delegation transaction successful:", result.transactionHash);

    return result;
  }

  public disconnect(): void {
    this.client?.disconnect();
    this.client = null;
    this.account = null;
    console.log("Stargate client disconnected.");
  }
}

// --- Example Usage ---
async function runDelegationExample() {
  // Replace with actual validator address
  const targetValidator = "cosmosvaloper1...";
  // Replace with desired delegation amount
  const amountToDelegate = "500000"; // 0.5 ATOM

  if (typeof signer === "undefined") {
    console.warn("Signer is not defined. Skipping example execution.");
    return;
  }
  if (!targetValidator || targetValidator.endsWith("...")) {
    console.warn(
      "Placeholder validator address detected. Skipping example execution.",
    );
    return;
  }

  const stakingConfig: StakingServiceConfig = {
    rpcEndpoint: RPC_ENDPOINT,
    signer: signer,
    gasPrice: DEFAULT_GAS_PRICE,
  };

  const stakingService = new StakingService(stakingConfig);

  try {
    await stakingService.connect();

    if (stakingService.isConnected()) {
      console.log("\n--- Starting Delegation ---");
      const txResult = await stakingService.delegate(
        targetValidator,
        amountToDelegate,
      );
      console.log("--- Delegation Finished ---");
      console.log("Gas Used:", txResult.gasUsed);
    }
  } catch (error) {
    console.error("An error occurred during the delegation process:", error);
  } finally {
    stakingService.disconnect();
  }
}

// Uncomment to run
// runDelegationExample();
