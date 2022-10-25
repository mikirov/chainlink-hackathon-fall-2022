import { ethers, upgrades } from "hardhat";

export async function deployPolygon() {
  const [polygonSigner] = await ethers.getSigners();

	const childTunenlFactory = await ethers.getContractFactory("ChildTunnel",polygonSigner);
	const childTunnel = await childTunenlFactory.deploy();
  await childTunnel.deployed();

  console.log("Polygon Tunnel deployed to: ", childTunnel.address);


	const polygonPoolFactory = await ethers.getContractFactory('LiquidityPool', polygonSigner);
	const polygonPool = await polygonPoolFactory.deploy(await polygonSigner.getAddress());
  await polygonPool.deployed();

  console.log("Polygon Pool deployed to: ", polygonPool.address);

	const polygonBridgeFactory = await ethers.getContractFactory("Bridge", polygonSigner);
	const polygonBridge = await upgrades.deployProxy(polygonBridgeFactory, [childTunnel.address, polygonPool.address], { unsafeAllow: ['delegatecall'] }) as Bridge;

	await polygonPool.setBridge(polygonBridge.address);
	await childTunnel.setParent(polygonBridge.address);

	console.log("Polygon Bridge Proxy deployed to:", polygonBridge.address);

}

// We recommend this pattern to be able to use async/await everywhere
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployPolygon()
      .then(() => process.exit(0))
      .catch((error: Error) => {
          console.error(error)
          process.exit(1)
      })
}