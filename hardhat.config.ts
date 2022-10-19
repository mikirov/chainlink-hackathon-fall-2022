import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

task("bridge-to-polygon", "Bridge token from Ethereum to Polygon").setAction(async (hre) => {
	const ethereumBridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const crosschainAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const Bridge = await ethers.getContractAt("Bridge", ethereumBridgeAddress);
	const Crosschain = await ethers.getContractAt("Crosschain", crosschainAddress);

	const tx = await Bridge.bridgeToPolygon(WETH, 1);
	const receipt = await tx.wait();

	const args = receipt.events?.filter((e) => e.event === "MessageSent")[0].args;

	console.log("Message sent to Polygon", args);
});

const config: HardhatUserConfig = {
	solidity: "0.8.17",
	networks: {
		local_ethereum: {
			url: "http://127.0.0.1:10",
		},
		local_polygon: {
			url: "http://127.0.0.1:1370",
		},
	},
};

export default config;
