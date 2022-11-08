import create from "zustand";
import config, { Token } from "./config";

type ProtocolState = {
  token: Token;
  tokenBalance: string;
  tokenLiquidityOfUser: string;
  tokenBalanceLoading: boolean;
  tokenLiquidityOfUserLoading: boolean;
  addLiquidityLoading: boolean;
  removeLiquidityLoading: boolean;
  setToken: (token: Token) => void;
  setTokenBalance: (balance: string) => void;
  setTokenLiquidityOfUser: (liquidity: string) => void;
  setTokenBalanceLoading: (loading: boolean) => void;
  setTokenLiquidityOfUserLoading: (loading: boolean) => void;
  setAddLiquidityLoading: (loading: boolean) => void;
  setRemoveLiquidityLoading: (loading: boolean) => void;
};
const useProtocolStore = create<ProtocolState>((set) => ({
  token: config.tokens["0x5"][0],
  tokenBalance: "0",
  tokenLiquidityOfUser: "0",
  tokenBalanceLoading: false,
  tokenLiquidityOfUserLoading: false,
  addLiquidityLoading: false,
  removeLiquidityLoading: false,
  setToken: (token) => set((state) => ({ ...state, token })),
  setTokenBalance: (tokenBalance) =>
    set((state) => ({ ...state, tokenBalance })),
  setTokenLiquidityOfUser: (tokenLiquidityOfUser) =>
    set((state) => ({ ...state, tokenLiquidityOfUser })),
  setTokenBalanceLoading: (tokenBalanceLoading) =>
    set((state) => ({ ...state, tokenBalanceLoading })),
  setTokenLiquidityOfUserLoading: (tokenLiquidityOfUserLoading) =>
    set((state) => ({ ...state, tokenLiquidityOfUserLoading })),
  setAddLiquidityLoading: (addLiquidityLoading) =>
    set((state) => ({ ...state, addLiquidityLoading })),
  setRemoveLiquidityLoading: (removeLiquidityLoading) =>
    set((state) => ({ ...state, removeLiquidityLoading })),
}));

export default useProtocolStore;
