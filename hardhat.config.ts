import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
	solidity: "0.8.17",
	networks: {
		local_ethereum: {
			url: "http://127.0.0.1:10",
		},
		local_polygon: {
			url: "http://127.0.0.1:1370",
		},
	},
};

export default config;
