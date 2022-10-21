import { ethers } from "ethers";
import RootTunnelPublicArtifact from "../../artifacts/contracts/test/RootTunnelPublic.sol/RootTunnelPublic.json";
import ChildTunnelPublicArtifact from "../../artifacts/contracts/test/ChildTunnelPublic.sol/ChildTunnelPublic.json";
import { RootTunnelPublic, ChildTunnelPublic } from "../../typechain-types";

async function main() {
    const tunnelAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const bridgeUserPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const ethereumProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const polygonProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8546");

    // ethers.getSigner() cannot use a custom provider
    const bridgeUser = new ethers.Wallet(bridgeUserPrivateKey);
    const ethereumBridgeUser = bridgeUser.connect(ethereumProvider);
    const polygonBridgeUser = bridgeUser.connect(polygonProvider);

    const RootTunnelPublicContract = new ethers.Contract(tunnelAddress, RootTunnelPublicArtifact.abi, ethereumBridgeUser) as RootTunnelPublic;
    const ChildTunnelPublicContract = new ethers.Contract(tunnelAddress, ChildTunnelPublicArtifact.abi, polygonBridgeUser) as ChildTunnelPublic;

    ethereumProvider.once('block', () => {
        RootTunnelPublicContract.on("MessageSent", async (message) => {
            console.log("New message received from Ethereum to Polygon. Calling the Polygon Bridge", message);

            await ChildTunnelPublicContract.processMessageFromRootTunnel(message, {gasLimit: 1_000_000});
        });
    });
    polygonProvider.once('block', () => {
        ChildTunnelPublicContract.on("MessageSent", async (message) => {
            console.log("New message received from Polygon to Ethereum. Calling the Ethereum Bridge", message);

            await RootTunnelPublicContract.processMessageFromChildTunnel(message);
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
