import hre from "hardhat";
import { Bridge } from "../typechain-types";

export async function deploy() {
  await hre.run("compile");

  // @ts-ignore
  hre.changeNetwork("goerli");

  console.log("Deploying to Goerli...");
  const [ethereumSigner] = await hre.ethers.getSigners();

  // const rootTunnelFactory = await hre.ethers.getContractFactory(
  //   "RootTunnel",
  //   ethereumSigner
  // );
  // const rootTunnel = await rootTunnelFactory.deploy({ gasLimit: 10_000_000 });
  // await rootTunnel.deployed();

  // console.log("Ethereum Tunnel deployed to: ", rootTunnel.address);

  // const ethereumPoolFactory = await hre.ethers.getContractFactory(
  //   "LiquidityPool",
  //   ethereumSigner
  // );
  // const ethereumPool = await ethereumPoolFactory.deploy(
  //   await ethereumSigner.getAddress(),
  //   { gasLimit: 10_000_000 }
  // );
  // await ethereumPool.deployed();

  // console.log("Ethereum Pool deployed to: ", ethereumPool.address);

  // const ethereumTokenMappingFactory = await hre.ethers.getContractFactory(
  //   "TokenMapping",
  //   ethereumSigner
  // );
  // const ethereumTokenMapping = await ethereumTokenMappingFactory.deploy({
  //   gasLimit: 10_000_000,
  // });
  // await ethereumTokenMapping.deployed();

  // console.log(
  //   "Ethereum Token Mapping deployed to: ",
  //   ethereumTokenMapping.address
  // );

  // const ethereumBridgeFactory = await hre.ethers.getContractFactory(
  //   "Bridge",
  //   ethereumSigner
  // );
  // const ethereumBridge = (await hre.upgrades.deployProxy(
  //   ethereumBridgeFactory,
  //   [rootTunnel.address, ethereumPool.address, ethereumTokenMapping.address],
  //   { unsafeAllow: ["delegatecall"], timeout: 0 }
  // )) as Bridge;

  // console.log("Ethereum Bridge Proxy deployed to:", ethereumBridge.address);

  // await ethereumPool.setBridge(ethereumBridge.address);
  // await rootTunnel.setParent(ethereumBridge.address);

  // console.log("Ethereum Pool and RootTunnel set to Bridge");

  // @ts-ignore
  hre.changeNetwork("mumbai");

  const [polygonSigner] = await hre.ethers.getSigners();

  const childTunenlFactory = await hre.ethers.getContractFactory(
    "ChildTunnel",
    polygonSigner
  );
  const childTunnel = await childTunenlFactory.deploy({ gasLimit: 10_000_000 });
  await childTunnel.deployed();

  console.log("Polygon Tunnel deployed to: ", childTunnel.address);

  const polygonPoolFactory = await hre.ethers.getContractFactory(
    "LiquidityPool",
    polygonSigner
  );
  const polygonPool = await polygonPoolFactory.deploy(
    await polygonSigner.getAddress(),
    { gasLimit: 10_000_000 }
  );
  await polygonPool.deployed();

  console.log("Polygon Pool deployed to: ", polygonPool.address);

  const polygonTokenMappingFactory = await hre.ethers.getContractFactory(
    "TokenMapping",
    polygonSigner
  );
  const polygonTokenMapping = await polygonTokenMappingFactory.deploy({
    gasLimit: 10_000_000,
  });
  await polygonTokenMapping.deployed();

  console.log(
    "Polygon Token Mapping deployed to: ",
    polygonTokenMapping.address
  );

  const polygonBridgeFactory = await hre.ethers.getContractFactory(
    "Bridge",
    polygonSigner
  );
  const polygonBridge = (await hre.upgrades.deployProxy(
    polygonBridgeFactory,
    [childTunnel.address, polygonPool.address, polygonTokenMapping.address],
    { unsafeAllow: ["delegatecall"], timeout: 0 }
  )) as Bridge;

  console.log("Polygon Bridge Proxy deployed to:", polygonBridge.address);

  await polygonPool.setBridge(polygonBridge.address);
  await childTunnel.setParent(polygonBridge.address);

  console.log("Polygon Pool and ChildTunnel set to Bridge");

  const rootTunnel = { address: "0xcB14D16F3D1Ab7c988d3aF8108C45c88A0Fdd906" };
  await childTunnel.setFxRootTunnel(rootTunnel.address);

  // hre.changeNetwork("goerli");
  // await rootTunnel.setFxChildTunnel(childTunnel.address);

  console.log("RootTunnel and ChildTunnel set to each other");
}

// We recommend this pattern to be able to use async/await everywhere
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}
