import { POSClient, use } from "@maticnetwork/maticjs";
import { ethers } from "ethers";
import { Web3ClientPlugin } from "@maticnetwork/maticjs-ethers";
import dotenv from "dotenv";

dotenv.config();

use(Web3ClientPlugin);

const MESSAGE_SENT_EVENT_SIGNATURE =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";

const main = async () => {
  try {
    // for goerli - mumbai testnet
    const ethereumProvider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_GORLI_RPC_URL
    );
    const polygonProvider = new ethers.providers.JsonRpcProvider(
      process.env.POLYGON_MUMBAI_RPC_URL
    );

    const network = "testnet";
    const version = "mumbai";
    const posClient = new POSClient();

    const client = await posClient.init({
      log: true,
      network: network,
      version: version,
      child: {
        provider: new ethers.Wallet(
          process.env.DEPLOYER_PRIVATE_KEY!,
          polygonProvider
        ),
        defaultConfig: {
          from: process.env.DEPLOYER_WALLET_ADDRESS!,
        },
      },
      parent: {
        provider: new ethers.Wallet(
          process.env.DEPLOYER_PRIVATE_KEY!,
          ethereumProvider
        ),
        defaultConfig: {
          from: process.env.DEPLOYER_WALLET_ADDRESS!,
        },
      },
    });
    // Polygon -> Ethereum transaction hash
    const txHash =
      "0xb22eea1b52371c38befa0964dd0d4bd09fef8c4aa5e2ab08e9738ecccb09b808";
    // it takes up to 1 hour
    const isCheckpointed = await client.isCheckPointed(txHash);

    console.log(new Date().toLocaleString(), "Checkpointed", isCheckpointed);
    // if (isCheckpointed) {
    const proof = await client.exitUtil.buildPayloadForExit(
      txHash,
      MESSAGE_SENT_EVENT_SIGNATURE,
      false
    );

    console.log(proof);
  } catch (error: any) {
    console.error(error.message);
  }
};

main();
