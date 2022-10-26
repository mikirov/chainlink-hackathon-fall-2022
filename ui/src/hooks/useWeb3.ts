import React from "react";
import { ethers } from "ethers";
import { useConnectedMetaMask } from "metamask-react";

import ERC20Abi from "../abi/ERC20.json";
import LiquidityPoolAbi from "../abi/LiquidityPool.json";

import config, { type Chain } from "../config";

export type UseWeb3 = {
  chain: Chain;
  account: string;
  addChain: (parameters: any) => Promise<any>;
  switchChain: (chainId: string) => Promise<void>;
  sourceProvider: ethers.providers.JsonRpcProvider;
  getTokenBalanceOfCurrentAccount: (
    address: string
  ) => Promise<ethers.BigNumber>;
};
const useWeb3 = (): UseWeb3 => {
  const metamask = useConnectedMetaMask();
  const [chain, setChain] = React.useState<Chain>(
    config.chains[metamask.chainId]
  );
  const [sourceProvider, setSourceProvider] =
    React.useState<ethers.providers.JsonRpcProvider>(
      new ethers.providers.JsonRpcProvider(
        config.chains[metamask.chainId].rpcUrls[0]
      )
    );

  React.useEffect(() => {
    setChain(config.chains[metamask.chainId]);
    if (metamask.chainId)
      setSourceProvider(
        new ethers.providers.JsonRpcProvider(
          config.chains[metamask.chainId].rpcUrls[0]
        )
      );
  }, [metamask.account, metamask.chainId]);

  const switchChain = (id: string) =>
    metamask
      .switchChain(id)
      .catch((error) =>
        error.code === 4902 ? metamask.addChain(config.chains[id]) : error
      );

  const getTokenBalanceOfCurrentAccount = async (address: string) => {
    const erc20 = new ethers.Contract(address, ERC20Abi, sourceProvider!);
    const balance = await erc20.balanceOf(metamask.account);
    console.log("balance", balance);

    return ethers.BigNumber.from(balance);
  };

  return {
    chain,
    account: metamask.account,
    addChain: metamask.addChain,
    switchChain,
    sourceProvider,
    getTokenBalanceOfCurrentAccount,
  };
};

export default useWeb3;
