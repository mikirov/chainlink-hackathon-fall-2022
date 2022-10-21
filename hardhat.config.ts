import { HardhatUserConfig, task } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "hardhat-interface-generator";
import { ethers } from "ethers";

import dotenv from 'dotenv';

dotenv.config();


task("bridge-to-polygon", "Bridge token from Ethereum to Polygon").setAction(
  async (args, hre) => {
    const bridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const tunnelAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const Bridge = await hre.ethers.getContractAt("Bridge", bridgeAddress);

    const tx = await Bridge.bridgeToken(WETH, 100, { gasLimit: 1_000_000 });
    await tx.wait();

    console.log("Done.");
  }
);

task("bridge-to-ethereum", "Bridge token from Polygon to Ethereum").setAction(
  async (args, hre) => {
    const bridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const tunnelAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const Bridge = await hre.ethers.getContractAt("Bridge", bridgeAddress);

    const tx = await Bridge.bridgeToken(WETH, 1);
    await tx.wait();

    console.log("Done.");
  }
);

task("get-bridged-balance", async (args, hre) => {
  const [bridgeUser] = await hre.ethers.getSigners();
  const bridgeAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const Bridge = await hre.ethers.getContractAt("Bridge", bridgeAddress);

  const withdrawableTokens = await Bridge.withdrawable(
    bridgeUser.address,
    WETH
  );

  console.log(withdrawableTokens);
});

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    local_ethereum: {
      url: "http://127.0.0.1:8545",
    },
    local_polygon: {
      url: "http://127.0.0.1:8546",
    },
  },
};

export default config;
