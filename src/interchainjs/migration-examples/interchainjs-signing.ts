import { SigningClient } from "@interchainjs/cosmos/signing-client";
import { DirectGenericOfflineSigner } from "@interchainjs/cosmos/types/wallet";
import { assertIsDeliverTxSuccess } from "@interchainjs/cosmos/utils";
import { Secp256k1HDWallet } from "@interchainjs/cosmos/wallets/secp256k1hd";
import { HDPath } from "@interchainjs/types";
import type { MsgSend } from "interchainjs/cosmos/bank/v1beta1/tx";
import { send } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";

// --- Configuration & Setup ---

const rpcEndpoint = "rpc.cosmos.network:26657"; // Replace with your RPC endpoint
const senderMnemonic = "..."; // Replace with a valid mnemonic (for testing only!)
const recipientAddress = "cosmos1..."; // Replace with a recipient address
const amountToSend = {
  denom: "uatom",
  amount: "1000",
};
const chainPrefix = "cosmos"; // Prefix for Cosmos Hub

// Fee object (adjust gas limit and amount as needed)
const fee = {
  amount: [
    {
      denom: amountToSend.denom, // Match the send denom
      amount: "5000", // Example fee amount
    },
  ],
  gas: "200000", // Example gas limit
};
const memo = "Sent via InterchainJS";

// --- Main Signing Logic (Conceptual Example) ---

async function signAndBroadcast() {
  // 1. Initialize wallet and get signer
  const wallet = Secp256k1HDWallet.fromMnemonic(senderMnemonic, [
    {
      prefix: chainPrefix,
      hdPath: HDPath.cosmos(0, 0, 0).toString(), // Standard Cosmos path
    },
  ]);
  const offlineSigner = wallet.toOfflineDirectSigner();
  const [firstAccount] = await offlineSigner.getAccounts();
  const senderAddress = firstAccount.address;

  console.log(`Sender address: ${senderAddress}`);

  // 2. Wrap signer and create the signing client
  const genericSigner = new DirectGenericOfflineSigner(offlineSigner);
  const signingClient = await SigningClient.connectWithSigner(
    rpcEndpoint,
    genericSigner,
    {
      // Optional: Configure broadcast options if needed
      broadcast: {
        checkTx: true,
        deliverTx: true,
      },
    },
  );

  // 3. Prepare the message payload for the 'send' function
  // Note: The 'send' function takes the message fields directly
  const msgPayload: MsgSend = {
    fromAddress: senderAddress,
    toAddress: recipientAddress,
    amount: [amountToSend],
  };

  // 4. Call the specific 'send' function
  try {
    const result = await send(
      signingClient,
      senderAddress, // Sender address
      msgPayload, // The message payload
      fee, // The fee object
      memo, // The memo string
    );
    console.log(result);

    // Optional: Check for success (interchainjs might throw on error depending on setup)
    assertIsDeliverTxSuccess(result);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

// --- Execute the function ---
// signAndBroadcast(); // Uncomment to run, requires valid RPC and mnemonic
