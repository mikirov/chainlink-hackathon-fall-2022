import { ethers } from "hardhat";

async function main() {
  const [bridgeOracle] = await ethers.getSigners();
  const ChildTunnel = await ethers.getContractFactory("ChildTunnelPublic");
  const Bridge = await ethers.getContractFactory("Bridge");

  const childTunnel = await ChildTunnel.deploy();

  await childTunnel.deployed();

  const bridge = await Bridge.deploy(
    ethers.constants.AddressZero,
    childTunnel.address
  );

  await bridge.deployed();

  await childTunnel.setParent(bridge.address);
  await childTunnel.setFxRootTunnel(bridgeOracle.address)

  console.log(`Deployed to Polygon`);
  console.log(`ChildTunnel ${childTunnel.address}`);
  console.log(`Bridge ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
