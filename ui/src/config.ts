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

export const ETHEREUM_GORLI: Chain = {
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
export const POLYGON_MUMBAI: Chain = {
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

export const ETHEREUM_GORLI_TST1 = "0x011C1B8a25e4f309e78f717cF021939c4b5f2E6F";
export const POLYGON_MUMBAI_TST1 = "0x565A39628964995F1D74502d03838b42E280b18b";

export const ETHEREUM_GORLI_LIQUIDITY_POOL =
  "0xa0EA167a5163634Fb016743E4f34e0a7B728D50b";
export const ETHEREUM_GORLI_BRIDGE =
  "0xB370736D491294D183E4aFf5b7ccd30289bB3d54";
export const POLYGON_MUMBAI_LIQUIDITY_POOL = "0x11f3D2df3082D52d20A3a1633C34a25338D1C56c";
export const POLYGON_MUMBAI_BRIDGE = "0x595D8B115eAC4F56EAd6BBd2914d7556F238A0e9";

export type Token = {
  id: number;
  address: string;
  name: string;
  image?: string;
};

type ChainList = Chain[];
type TokenList = Token[];
type Config = {
  supportedChains: string[];
  chains: { [key: string]: Chain };
  contracts: {
    [key: string]: {
      LIQUIDITY_POOL: string;
      BRIDGE: string;
    };
  };
  tokens: { [key: string]: TokenList };
};

const configTestnet: Config = {
  supportedChains: [ETHEREUM_GORLI.chainId, POLYGON_MUMBAI.chainId],
  chains: {
    "0x5": ETHEREUM_GORLI,
    "0x13881": POLYGON_MUMBAI,
  },
  tokens: {
    "0x5": [
      {
        id: 1,
        address: ETHEREUM_GORLI_TST1,
        name: "TST1",
      },
    ],
    "0x13881": [
      {
        id: 1,
        address: POLYGON_MUMBAI_TST1,
        name: "TST2",
      },
    ],
  },
  contracts: {
    "0x5": {
      LIQUIDITY_POOL: ETHEREUM_GORLI_LIQUIDITY_POOL,
      BRIDGE: ETHEREUM_GORLI_BRIDGE,
    },
    "0x13881": {
      LIQUIDITY_POOL: POLYGON_MUMBAI_LIQUIDITY_POOL,
      BRIDGE: POLYGON_MUMBAI_BRIDGE,
    },
  },
};

const config = configTestnet;
export default config;
