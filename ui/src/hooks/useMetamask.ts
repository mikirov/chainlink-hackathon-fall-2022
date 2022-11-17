import React from "react";
import { ethers } from "ethers";
import { useConnectedMetaMask } from "metamask-react";

import config, { type Chain } from "../config";

export type UseMetamask = {
  chain: Chain;
  account: string;
  addChain: (parameters: any) => Promise<any>;
  switchChain: (chainId: string) => Promise<void>;
  sourceProvider: ethers.providers.JsonRpcProvider;
};
const useMetamask = (): UseMetamask => {
  const metamask = useConnectedMetaMask();

  const [chain, setChain] = React.useState<Chain>(
    config.chains[metamask.chainId]
  );
  const [sourceProvider, setSourceProvider] =
    React.useState<ethers.providers.JsonRpcProvider>(
      new ethers.providers.Web3Provider(metamask.ethereum)
    );

  React.useEffect(() => {
    const currentChain = config.chains[metamask.chainId];
    setChain(currentChain);
    setSourceProvider(new ethers.providers.Web3Provider(metamask.ethereum));
  }, [metamask.chainId]);

  const switchChain = (id: string) =>
    metamask
      .switchChain(id)
      .catch((error) =>
        error.code === 4902 ? metamask.addChain(config.chains[id]) : error
      );

  return {
    chain,
    account: metamask.account,
    addChain: metamask.addChain,
    switchChain,
    sourceProvider,
  };
};

export default useMetamask;
