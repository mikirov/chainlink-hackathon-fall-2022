import { ethers } from "hardhat";

async function main() {
  const [bridgeOracle] = await ethers.getSigners();
  const ChildTunnel = await ethers.getContractFactory("ChildTunnelPublic");
  const Bridge = await ethers.getContractFactory("Bridge");
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");

  const rootTunnel = await ChildTunnel.deploy();
  const liquidityPool = await LiquidityPool.deploy(bridgeOracle.address);

  await rootTunnel.deployed();

  const bridge = await Bridge.deploy(rootTunnel.address, liquidityPool.address);

  await bridge.deployed();

  await rootTunnel.setParent(bridge.address);
  await rootTunnel.setFxRootTunnel(bridgeOracle.address);
  await liquidityPool.setBridge(bridge.address);

  console.log(`Deployed to Ethereum`);
  console.log(`RootTunnel ${rootTunnel.address}`);
  console.log(`LiquidityPool ${liquidityPool.address}`);
  console.log(`Bridge ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
