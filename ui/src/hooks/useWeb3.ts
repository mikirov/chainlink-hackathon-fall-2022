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
  addLiquidity: (tokenAddress: string, amount: string) => Promise<void>;
};
const useWeb3 = (): UseWeb3 => {
  const metamask = useConnectedMetaMask();
  const [chain, setChain] = React.useState<Chain>(
    config.chains[metamask.chainId]
  );
  const [sourceProvider, setSourceProvider] =
    React.useState<ethers.providers.JsonRpcProvider>(
      new ethers.providers.Web3Provider(metamask.ethereum)
    );

  const LIQUIDITY_POOL_ADDRESS = config.contracts[chain.chainId].LIQUIDITY_POOL;

  React.useEffect(() => {
    const currentChain = config.chains[metamask.chainId];
    setChain(currentChain);
    setSourceProvider(new ethers.providers.Web3Provider(metamask.ethereum));
  }, [metamask.chainId]);

  const _getERC20Contract = (tokenAddress: string) =>
    new ethers.Contract(tokenAddress, ERC20Abi, sourceProvider.getSigner());

  const _getLiquidityPoolContract = () =>
    new ethers.Contract(
      LIQUIDITY_POOL_ADDRESS,
      LiquidityPoolAbi,
      sourceProvider.getSigner()
    );

  const approveToken = async (token: string, amount: string) => {
    const approveTransaction = await _getERC20Contract(token).approve(
      LIQUIDITY_POOL_ADDRESS,
      amount
    );

    return approveTransaction.wait();
  };

  const addLiquidityToken = async (token: string, amount: string) => {
    const addLiquidityTransaction =
      await _getLiquidityPoolContract().addLiquidity(token, amount);
    return addLiquidityTransaction.wait();
  };

  const switchChain = (id: string) =>
    metamask
      .switchChain(id)
      .catch((error) =>
        error.code === 4902 ? metamask.addChain(config.chains[id]) : error
      );

  const getTokenBalanceOfCurrentAccount = async (address: string) => {
    const balance = await _getERC20Contract(address).balanceOf(
      metamask.account
    );
    console.log("balance", balance);

    return ethers.BigNumber.from(balance);
  };

  const addLiquidity = async (tokenAddress: string, amount: string) => {
    const depositBalance = ethers.utils.parseEther(amount);
    console.log("depositBalance", depositBalance);

    const approve = await approveToken(tokenAddress, amount);

    console.log("approve", approve);

    // const addLP = await addLiquidityToken(tokenAddress, amount);

    // console.log("addLiquidity", addLP);
  };

  return {
    chain,
    account: metamask.account,
    addChain: metamask.addChain,
    switchChain,
    sourceProvider,
    getTokenBalanceOfCurrentAccount,
    addLiquidity,
  };
};

export default useWeb3;
