import React from "react";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";

import ERC20Abi from "../abi/ERC20.json";
import LiquidityPoolAbi from "../abi/LiquidityPool.json";

import config, { ETHEREUM_GORLI, POLYGON_MUMBAI, type Chain } from "../config";

export type UseWeb3 = {
  disconnect: () => void;
  connect: () => Promise<void>;
  connected: boolean;
  balance: ethers.BigNumber;
  chain: Chain | null;
  account: string | null;
  chainId: string | null;
  addChain: (parameters: any) => Promise<any>;
  switchChain: (chainId: string) => Promise<void>;
  sourceProvider: ethers.providers.JsonRpcProvider | null;
  // ethereumProvider: ethers.providers.JsonRpcProvider;
  // polygonProvider: ethers.providers.JsonRpcProvider;
  getTokenBalanceOfCurrentAccount: (
    address: string
  ) => Promise<ethers.BigNumber>;
};
const useWeb3 = (): UseWeb3 => {
  const metamask = useMetaMask();
  const [chain, setChain] = React.useState<Chain | null>(null);
  const [connected, setConnected] = React.useState(!!metamask.account);
  const [balance, setBalance] = React.useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );
  const [sourceProvider, setSourceProvider] =
    React.useState<ethers.providers.JsonRpcProvider | null>(null);
  // const [ethereumProvider, setEthereumProvider] =
  //   React.useState<ethers.providers.JsonRpcProvider>(
  //     new ethers.providers.JsonRpcProvider(ETHEREUM_GORLI.rpcUrls[0])
  //   );
  // const [polygonProvider, setPolygonProvider] =
  //   React.useState<ethers.providers.JsonRpcProvider>(
  //     new ethers.providers.JsonRpcProvider(POLYGON_MUMBAI.rpcUrls[0])
  //   );

  React.useEffect(() => {
    getBalance().then(ethers.BigNumber.from).then(setBalance);
    setChain(metamask.chainId ? config.chains[metamask.chainId] : null);
    if (metamask.chainId)
      setSourceProvider(
        new ethers.providers.JsonRpcProvider(
          config.chains[metamask.chainId].rpcUrls[0]
        )
      );
  }, [metamask.account, metamask.chainId]);

  const disconnect = () => setConnected(false);
  const connect = () =>
    metamask
      .connect()
      .then(() => getBalance().then(ethers.BigNumber.from).then(setBalance))
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

  const getBalance = async () => {
    return (
      (metamask.account &&
        metamask.ethereum.request({
          method: "eth_getBalance",
          params: [metamask.account, "latest"],
        })) ||
      "0x0"
    );
  };

  const switchChain = (id: string) =>
    metamask
      .switchChain(id)
      .catch((error) =>
        error.code === 4902 ? metamask.addChain(config.chains[id]) : error
      );

  const getTokenBalanceOfCurrentAccount = async (
    address: string
  ): Promise<ethers.BigNumber> => {
    let balance = 0;

    if (connected && sourceProvider) {
      const erc20 = new ethers.Contract(address, ERC20Abi, sourceProvider!);
      balance = await erc20.balanceOf(metamask.account);
      console.log("balance", balance);
    }

    return ethers.BigNumber.from(balance);
  };

  return {
    connect,
    connected,
    disconnect,
    balance,
    chain,
    account: metamask.account,
    chainId: metamask.chainId,
    addChain: metamask.addChain,
    switchChain,
    sourceProvider,
    // ethereumProvider,
    // polygonProvider,
    getTokenBalanceOfCurrentAccount,
  };
};

export default useWeb3;
