import React from "react";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";

import config, { type Chain } from "../config";

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
};
const useWeb3 = (): UseWeb3 => {
  const metamask = useMetaMask();
  const [chain, setChain] = React.useState<Chain | null>(null);
  const [connected, setConnected] = React.useState(!!metamask.account);
  const [balance, setBalance] = React.useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );

  React.useEffect(() => {
    getBalance().then(ethers.BigNumber.from).then(setBalance);
    setChain(metamask.chainId ? config.chains[metamask.chainId] : null);
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
  };
};

export default useWeb3;
