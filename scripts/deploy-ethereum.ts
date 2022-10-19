import { ethers } from "hardhat";

async function main() {
	const Polygon = await ethers.getContractFactory("Crosschain");
	const Bridge = await ethers.getContractFactory("Bridge");

	const polygon = await Polygon.deploy();

	await polygon.deployed();

	const bridge = await Bridge.deploy(ethers.constants.AddressZero, ethers.constants.AddressZero, polygon.address);

	await bridge.deployed();

	await polygon.setBridge(bridge.address);

	console.log(`Deployed to Ethereum`);
	console.log(`Polygon ${polygon.address}`);
	console.log(`Bridge ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
