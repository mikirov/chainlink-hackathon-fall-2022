import { ethers, } from "hardhat";

export async function deployToken() {
    const [ethereumSigner] = await ethers.getSigners();
    const ownerAddress = await ethereumSigner.getAddress();
	const tokenFactory = await ethers.getContractFactory("TestBridgedToken", ethereumSigner);
	const token = await tokenFactory.deploy("TestBridgedToken", "TST1", ownerAddress);
    await token.deployed();

    console.log("Token deployed to: ", token.address);

    await token.mint(ownerAddress, ethers.utils.parseEther("100000", "ether"));

}

// We recommend this pattern to be able to use async/await everywhere
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployToken()
      .then(() => process.exit(0))
      .catch((error: Error) => {
          console.error(error)
          process.exit(1)
      })
}