import React from "react";
import { ethers } from "ethers";

import config, { type Chain } from "../config";
import ERC20Abi from "../abi/TestBridgedToken.json";
import LiquidityPoolAbi from "../abi/LiquidityPool.json";
import { LiquidityPool } from "../abi/LiquidityPool";

export type UseProtocol = {
  getTokenBalanceOfUser: (
    user: string,
    token: string
  ) => Promise<ethers.BigNumber>;
  addLiquidity: (tokenAddress: string, amount: string) => Promise<void>;
  removeLiquidity: (tokenAddress: string, amount: string) => Promise<void>;
  getLiquidityOfUser: (user: string, token: string) => Promise<any>;
  mintTokens: (token: string, to: string, amount: number) => Promise<void>;
};
const useProtocol = ({
  chain,
  provider,
}: {
  chain: Chain;
  provider: ethers.providers.JsonRpcProvider;
}): UseProtocol => {
  const LIQUIDITY_POOL_ADDRESS = config.contracts[chain.chainId].LIQUIDITY_POOL;

  const _getERC20Contract = (tokenAddress: string) =>
    new ethers.Contract(tokenAddress, ERC20Abi.abi, provider.getSigner());

  const _getLiquidityPoolContract = (): LiquidityPool =>
    new ethers.Contract(
      LIQUIDITY_POOL_ADDRESS,
      LiquidityPoolAbi,
      provider.getSigner()
    ) as LiquidityPool;

  const _approveTokenToLiquidityPool = async (
    token: string,
    amount: string
  ) => {
    const approveTransaction = await _getERC20Contract(token).approve(
      LIQUIDITY_POOL_ADDRESS,
      amount,
      {
        // gasLimit: 20000,
      }
    );

    return approveTransaction.wait();
  };

  const _addLiquidityOfToken = async (token: string, amount: string) => {
    const addLiquidityTransaction =
      await _getLiquidityPoolContract().addLiquidity(token, amount);
    return addLiquidityTransaction.wait();
  };

  const _removeLiquidityOfToken = async (token: string, amount: string) => {
    const removeLiquidityTransaction =
      await _getLiquidityPoolContract().removeLiquidity(token, amount);
    return removeLiquidityTransaction.wait();
  };

  const getTokenBalanceOfUser = async (user: string, token: string) => {
    const balance = await _getERC20Contract(token).balanceOf(user);
    console.log("balance", balance);

    return ethers.BigNumber.from(balance);
  };

  const addLiquidity = async (tokenAddress: string, amount: string) => {
    const depositAmount = ethers.utils.parseEther(amount);
    console.log("depositAmount", depositAmount);

    const approve = await _approveTokenToLiquidityPool(
      tokenAddress,
      depositAmount.toString()
    );

    console.log("approve", approve);

    const addLP = await _addLiquidityOfToken(
      tokenAddress,
      depositAmount.toString()
    );

    console.log("addLiquidity", addLP);
  };

  const removeLiquidity = async (tokenAddress: string, amount: string) => {
    const withdrawAmount = ethers.utils.parseEther(amount);
    const addLP = await _removeLiquidityOfToken(
      tokenAddress,
      withdrawAmount.toString()
    );

    console.log("addLiquidity", addLP);
  };

  const getLiquidityOfUser = async (user: string, token: string) => {
    return _getLiquidityPoolContract().getLiquidityOfUser(user, token);
  };

  const mintTokens = async (token: string, to: string, amount: number) => {
    await _getERC20Contract(token).mint(to, ethers.utils.parseEther(amount.toString()));
  }

  return {
    addLiquidity,
    removeLiquidity,
    getLiquidityOfUser,
    getTokenBalanceOfUser,
    mintTokens
  };
};

export default useProtocol;
