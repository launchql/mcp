import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  calculateFee,
} from "@cosmjs/stargate";
import type { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";

// --- Configuration & Setup ---

const rpcEndpoint = "rpc.cosmos.network:26657"; // Replace with your RPC endpoint
const senderMnemonic = "..."; // Replace with a valid mnemonic (for testing only!)
const recipientAddress = "cosmos1..."; // Replace with a recipient address
const amountToSend = {
  denom: "uatom",
  amount: "1000",
};
const gasPrice = GasPrice.fromString("0.025uatom");
const gasLimit = 200000;
const fee = calculateFee(gasLimit, gasPrice);
const memo = "Sent via CosmJS";

// Type registry setup (only needed for custom message types, MsgSend is built-in)
// const registry = new Registry();
// const typeUrl = "/cosmos.bank.v1beta1.MsgSend"; // Example type URL
// registry.register(typeUrl, MsgSend);

// --- Main Signing Logic (Conceptual Example) ---

async function signAndBroadcast() {
  // 1. Get a signer (e.g., from a mnemonic or browser extension like Keplr)
  // Using mnemonic here for a self-contained example (DO NOT use mainnet mnemonics in code)
  const signer = await DirectSecp256k1HdWallet.fromMnemonic(senderMnemonic, {
    prefix: "cosmos",
  });
  const [firstAccount] = await signer.getAccounts();
  const senderAddress = firstAccount.address;

  console.log(`Sender address: ${senderAddress}`);

  // 2. Create the signing client
  const signingClient = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    signer,
    // Optional: Provide registry if using custom types
    // { registry: registry }
  );

  // 3. Create the message
  const message: MsgSend = {
    fromAddress: senderAddress,
    toAddress: recipientAddress,
    amount: [amountToSend],
  };

  // The type URL is crucial for Stargate messages
  const msgAny = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: message,
  };

  // 4. Sign and broadcast the transaction
  try {
    console.log("Signing and broadcasting transaction...");
    const result = await signingClient.signAndBroadcast(
      senderAddress,
      [msgAny], // Array of messages
      fee,
      memo,
    );
    console.log("Transaction successful:", result.transactionHash);
    console.log("Result details:", result);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

// --- Execute the function ---
// signAndBroadcast(); // Uncomment to run, requires valid RPC and mnemonic

console.log("Example signing code structure loaded.");
console.log("Ensure RPC endpoint and mnemonic are configured before running.");
