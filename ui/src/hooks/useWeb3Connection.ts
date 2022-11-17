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
  error: string;
};

const useWeb3Connection = (): Web3Connection => {
  const metamask = useMetaMask();

  const [chain, setChain] = React.useState<Chain | null>(null);
  const [error, setError] = React.useState("");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );

  React.useEffect(() => {
    if (connected === false) return;
    if (metamask.chainId === null) return;
    if (config.supportedChains.includes(metamask.chainId) === false) {
      return setError(`Chain ${metamask.chainId} not supported`);
    }

    getBalance().then(ethers.BigNumber.from).then(setBalance);
    setChain(metamask.chainId ? config.chains[metamask.chainId] : null);
  }, [connected, metamask.account, metamask.chainId]);

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
  const connect = async () => {
    if (config.supportedChains.includes(metamask.chainId || "") === false) {
      setConnected(false);
      setError(`Chain ${metamask.chainId} not supported`);
      return;
    }

    return metamask
      .connect()
      .then(() => getBalance().then(ethers.BigNumber.from).then(setBalance))
      .then(() => setConnected(true))
      .then(() => setError(""))
      .catch(() => setConnected(false));
  };

  return {
    chain,
    balance,
    error,
    connect,
    disconnect,
    connected,
    account: metamask.account,
  };
};

export default useWeb3Connection;
