import { ethers } from "ethers";
import Crosschain from "../artifacts/contracts/development/Crosschain.sol/Crosschain.json";
import { Crosschain as CrosschainContract } from "../typechain-types";

async function main() {
    const connectorAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const bridgeUserPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

    const ethereumProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const polygonProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8546");

    const bridgeUser = new ethers.Wallet(bridgeUserPrivateKey);
    const ethereumBridgeUser = bridgeUser.connect(ethereumProvider);
    const polygonBridgeUser = bridgeUser.connect(polygonProvider);

    const Polygon = new ethers.Contract(connectorAddress, Crosschain.abi, polygonBridgeUser) as CrosschainContract;
    const Ethereum = new ethers.Contract(connectorAddress, Crosschain.abi, ethereumBridgeUser) as CrosschainContract;

    ethereumProvider.once('block', () => {
        Ethereum.on("MessageSent", (message) => {
            console.log("New message received from Ethereum to Polygon. Calling the Polygon Bridge", message);

            Polygon.bridgeCall(message);
        });
    });
    polygonProvider.once('block', () => {
        Polygon.on("MessageSent", (message) => {
            console.log("New message received from Polygon to Ethereum. Calling the Ethereum Bridge", message);

            Ethereum.bridgeCall(message);
        });
    });

    console.log('Bridge Oracle is listening for transactions...');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
