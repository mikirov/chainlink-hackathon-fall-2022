import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig, task } from "hardhat/config";

task("bridge-to-polygon", "Bridge token from Ethereum to Polygon").setAction(async (args, hre) => {
	const ethereumBridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
	const crosschainAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const Bridge = await hre.ethers.getContractAt("Bridge", ethereumBridgeAddress);
	const Crosschain = await hre.ethers.getContractAt("Crosschain", crosschainAddress);

	Crosschain.on("MessageSent", (args) => console.log("MessageSsent", args))

	const tx = await Bridge.bridgeToPolygon(WETH, 1);
	await tx.wait();
});

task("bridge-to-ethereum", "Bridge token from Polygon to Ethereum").setAction(async (args, hre) => {
	const ethereumBridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
	const crosschainAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const Bridge = await hre.ethers.getContractAt("Bridge", ethereumBridgeAddress);
	const Crosschain = await hre.ethers.getContractAt("Crosschain", crosschainAddress);

	Crosschain.on("MessageSent", (args) => console.log("MessageSsent", args))
	
	const tx = await Bridge.bridgeToEthereum(WETH, 1);
	await tx.wait();
});

const config: HardhatUserConfig = {
	solidity: "0.8.17",
	networks: {
		local_ethereum: {
			url: "http://127.0.0.1:8545",
		},
		local_polygon: {
			url: "http://127.0.0.1:8546",
		},
	},
};

export default config;
