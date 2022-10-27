import { ethers } from "ethers";
import React from "react";
import shallow from "zustand/shallow";

import useProtocolStore from "../store";
import { type UseMetamask } from "./useMetamask";
import { type UseProtocol } from "./useProtocol";

export type UseWeb3 = {
  fetchTokenBalance: () => Promise<void>;
  fetchTokenLiquidityOfUser: () => Promise<void>;
  addLiquidity: (amount: string) => Promise<void>;
  removeLiquidity: (amount: string) => Promise<void>;
} & UseMetamask &
  Omit<UseProtocol, "addLiquidity" | "removeLiquidity">;
const useWeb3 = ({
  metamask,
  protocol,
}: {
  metamask: UseMetamask;
  protocol: UseProtocol;
}): UseWeb3 => {
  const [
    token,
    setTokenBalance,
    setTokenLiquidityOfUser,
    setTokenBalanceLoading,
    setAddLiquidityLoading,
    setRemoveLiquidityLoading,
    setTokenLiquidityOfUserLoading,
  ] = useProtocolStore(
    (state) => [
      state.token,
      state.setTokenBalance,
      state.setTokenLiquidityOfUser,
      state.setTokenBalanceLoading,
      state.setAddLiquidityLoading,
      state.setRemoveLiquidityLoading,
      state.setTokenLiquidityOfUserLoading,
    ],
    shallow
  );

  React.useEffect(() => {
    fetchTokenBalance();
    fetchTokenLiquidityOfUser();
  }, [token]);

  const fetchTokenLiquidityOfUser = async () => {
    setTokenLiquidityOfUserLoading(true);

    return protocol
      .getLiquidityOfUser(metamask.account, token.address)
      .then((balance) =>
        setTokenLiquidityOfUser(
          Number(ethers.utils.formatEther(balance)).toFixed(0)
        )
      )
      .finally(() => setTokenLiquidityOfUserLoading(false));
  };

  const fetchTokenBalance = async () => {
    setTokenBalanceLoading(true);

    return protocol
      .getTokenBalanceOfUser(metamask.account, token.address)
      .then((balance) =>
        setTokenBalance(Number(ethers.utils.formatEther(balance)).toFixed(0))
      )
      .finally(() => setTokenBalanceLoading(false));
  };

  const addLiquidity = async (amount: string) => {
    setAddLiquidityLoading(true);

    return protocol
      .addLiquidity(token.address, amount)
      .then(() => fetchTokenBalance())
      .then(() => fetchTokenLiquidityOfUser())
      .finally(() => setAddLiquidityLoading(false));
  };

  const removeLiquidity = async (amount: string) => {
    setRemoveLiquidityLoading(true);

    return protocol
      .removeLiquidity(token.address, amount)
      .then(() => fetchTokenBalance())
      .then(() => fetchTokenLiquidityOfUser())
      .finally(() => setRemoveLiquidityLoading(false));
  };

  return {
    ...metamask,
    ...protocol,
    fetchTokenBalance,
    fetchTokenLiquidityOfUser,
    addLiquidity,
    removeLiquidity,
  };
};

export default useWeb3;
