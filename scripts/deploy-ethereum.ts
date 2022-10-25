import { ethers, upgrades } from "hardhat";

export async function deployEthereum() {
  const [ethereumSigner] = await ethers.getSigners();

  const rootTunnelFactory = await ethers.getContractFactory("RootTunnel", ethereumSigner);
  const rootTunnel = await rootTunnelFactory.deploy();
  await rootTunnel.deployed();

  console.log("Ethereum Tunnel deployed to: ", rootTunnel.address);

  const ethereumPoolFactory = await ethers.getContractFactory('LiquidityPool', ethereumSigner);
  const ethereumPool = await ethereumPoolFactory.deploy(await ethereumSigner.getAddress());
  await ethereumPool.deployed();

  console.log("Ethereum Pool deployed to: ", ethereumPool.address);

  const ethereumBridgeFactory = await ethers.getContractFactory("Bridge", ethereumSigner);
  const ethereumBridge = await upgrades.deployProxy(ethereumBridgeFactory, [rootTunnel.address, ethereumPool.address]) as Bridge;
  await ethereumBridge.deployed();

  await ethereumPool.setBridge(ethereumBridge.address);
  await rootTunnel.setBridge(ethereumBridge.address);

  console.log("Ethereum Bridge Proxy deployed to:", ethereumBridge.address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployEthereum()
      .then(() => process.exit(0))
      .catch((error: Error) => {
          console.error(error)
          process.exit(1)
      })
}