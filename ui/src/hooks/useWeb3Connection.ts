import { ethers } from "ethers";
import React, { useState } from "react";
import { useMetaMask } from "metamask-react";

import config, { Chain } from "../config";

export type Web3Connection = {
  disconnect: () => void;
  connect: () => Promise<void>;
  connected: boolean;
  balance: ethers.BigNumber;
  account: string | null;
  chain: Chain | null;
};

const useWeb3Connection = (): Web3Connection => {
  const metamask = useMetaMask();

  const [chain, setChain] = React.useState<Chain | null>(null);
  const [connected, setConnected] = useState(metamask.status === "connected");
  const [balance, setBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );

  React.useEffect(() => {
    getBalance().then(ethers.BigNumber.from).then(setBalance);
    setChain(metamask.chainId ? config.chains[metamask.chainId] : null);
  }, [metamask.account, metamask.chainId]);

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

  const disconnect = () => setConnected(false);
  const connect = () =>
    metamask
      .connect()
      .then(() => getBalance().then(ethers.BigNumber.from).then(setBalance))
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

  return {
    chain,
    balance,
    connect,
    disconnect,
    connected,
    account: metamask.account,
  };
};

export default useWeb3Connection;
