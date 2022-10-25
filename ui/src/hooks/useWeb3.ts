import React from "react";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";

export type UseWeb3 = {
  disconnect: () => void;
  connect: () => Promise<void>;
  connected: boolean;
  balance: ethers.BigNumber;
  account: string | null;
  chainId: string | null;
  addChain: (parameters: any) => Promise<any>;
  switchChain: (chainId: string) => Promise<any>;
};
const useWeb3 = (): UseWeb3 => {
  const metamask = useMetaMask();
  const [connected, setConnected] = React.useState(!!metamask.account);
  const [balance, setBalance] = React.useState<ethers.BigNumber>(
    ethers.BigNumber.from(0)
  );

  React.useEffect(() => {
    getBalance().then(ethers.BigNumber.from).then(setBalance);
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

  return {
    connect,
    connected,
    disconnect,
    balance,
    account: metamask.account,
    chainId: metamask.chainId,
    addChain: metamask.addChain,
    switchChain: metamask.switchChain,
  };
};

export default useWeb3;
