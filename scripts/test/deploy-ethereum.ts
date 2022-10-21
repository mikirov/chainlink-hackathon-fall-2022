import { ethers } from "hardhat";

async function main() {
	const [bridgeOracle] = await ethers.getSigners();
	const RootTunnel = await ethers.getContractFactory("RootTunnelPublic");
	const Bridge = await ethers.getContractFactory("Bridge");

	const rootTunnel = await RootTunnel.deploy();

	await rootTunnel.deployed();

	const bridge = await Bridge.deploy(rootTunnel.address, process.env.SALT);

	await bridge.deployed();

	await rootTunnel.setParent(bridge.address);
	await rootTunnel.setFxChildTunnel(bridgeOracle.address)

	console.log(`Deployed to Ethereum`);
	console.log(`RootTunnel ${rootTunnel.address}`);
	console.log(`Bridge ${bridge.address}`);

	console.log("Liquidity pool address: ", await bridge.liquidityPool());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
