import { ethers } from "hardhat";

async function main() {
	const Ethereum = await ethers.getContractFactory("Crosschain");
	const Bridge = await ethers.getContractFactory("Bridge");

	const ethereum = await Ethereum.deploy();

	await ethereum.deployed();

	const bridge = await Bridge.deploy(ethers.constants.AddressZero, ethereum.address, ethers.constants.AddressZero);

	await bridge.deployed();

	await ethereum.setBridge(bridge.address);

	console.log(`Deployed to Polygon`);
	console.log(`Ethereum ${ethereum.address}`);
	console.log(`Bridge ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
