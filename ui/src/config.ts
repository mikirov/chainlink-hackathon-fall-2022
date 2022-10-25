interface AddEthereumChainParameter {
  chainId: string;
  blockExplorerUrls: string[];
  chainName: string;
  iconUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
}

export type Chain = {} & AddEthereumChainParameter;

const ETHEREUM_GORLI: Chain = {
  chainId: "0x5",
  blockExplorerUrls: ["https://goerli.etherscan.io/"],
  chainName: "Ethereum",
  iconUrls: ["/ethereum.svg"],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://eth-goerli.public.blastapi.io/"],
};
const POLYGON_MUMBAI: Chain = {
  chainId: "0x13881",
  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  chainName: "Polygon",
  iconUrls: ["/polygon.png"],
  nativeCurrency: {
    name: "Matic",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.ankr.com/polygon_mumbai/"],
};

type ChainList = Chain[];
type Config = {
  supportedChains: ChainList;
  chains: { [key: string]: Chain };
};

const config: Config = {
  supportedChains: [ETHEREUM_GORLI, POLYGON_MUMBAI],
  chains: {
    "0x5": ETHEREUM_GORLI,
    "0x13881": POLYGON_MUMBAI,
  },
};

export default config;
