import { ethers } from "hardhat";

async function main() {
	const Bridge = await ethers.getContractFactory("Bridge");
	const bridge = await Bridge.deploy(
		ethers.constants.AddressZero,
		ethers.constants.AddressZero,
		ethers.constants.AddressZero
	);

	await bridge.deployed();

	console.log(`Bridge deployed at ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
