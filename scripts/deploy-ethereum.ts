import { ethers, upgrades } from "hardhat";

export async function deployEthereum() {
  const [ethereumSigner] = await ethers.getSigners();

  const rootTunnelFactory = await ethers.getContractFactory("RootTunnel", ethereumSigner);
  const rootTunnel = await rootTunnelFactory.deploy();
  // console.log(rootTunnel);
  await rootTunnel.deployed();

  console.log("Ethereum Tunnel deployed to: ", rootTunnel.address);

  const ethereumPoolFactory = await ethers.getContractFactory('LiquidityPool', ethereumSigner);
  const ethereumPool = await ethereumPoolFactory.deploy(await ethereumSigner.getAddress());
  console.log(ethereumPool);
  await ethereumPool.deployed();

  console.log("Ethereum Pool deployed to: ", ethereumPool.address);

  const ethereumTokenMappingFactory = await ethers.getContractFactory('TokenMapping', ethereumSigner);
  const ethereumTokenMapping = await ethereumTokenMappingFactory.deploy();
  await ethereumTokenMapping.deployed();

  const ethereumBridgeFactory = await ethers.getContractFactory("Bridge", ethereumSigner);
  const ethereumBridge = await upgrades.deployProxy(ethereumBridgeFactory, [rootTunnel.address, ethereumPool.address, ethereumTokenMapping.address], { unsafeAllow: ['delegatecall'] }) as Bridge;

  await ethereumPool.setBridge(ethereumBridge.address);
  await rootTunnel.setParent(ethereumBridge.address);

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