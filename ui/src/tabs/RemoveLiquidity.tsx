import React from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  Spinner,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import shallow from "zustand/shallow";

import config from "../config";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import { UseWeb3 } from "../hooks/useWeb3";
import useNotification from "../hooks/useNotification";
import useProtocolStore from "../store";

type RemoveLiquidityProps = { web3: UseWeb3 };
const RemoveLiquidity: React.FunctionComponent<RemoveLiquidityProps> = ({
  web3,
}) => {
  const [tokenBalanceInput, setTokenBalanceInput] = React.useState("");
  const [
    token,
    tokenBalance,
    tokenLiquidityOfUser,
    tokenBalanceLoading,
    removeLiquidityLoading,
    tokenLiquidityOfUserLoading,
    setToken,
  ] = useProtocolStore(
    (state) => [
      state.token,
      state.tokenBalance,
      state.tokenLiquidityOfUser,
      state.tokenBalanceLoading,
      state.removeLiquidityLoading,
      state.tokenLiquidityOfUserLoading,
      state.setToken,
    ],
    shallow
  );

  const { showError, showSuccess } = useNotification();

  const tokenBalanceInputError = React.useMemo(() => {
    const balance = Number(tokenBalanceInput);
    return (
      Number.isNaN(balance) ||
      balance === 0 ||
      balance > Number(tokenLiquidityOfUser)
    );
  }, [tokenBalanceInput]);

  const removeLiquidity = () => {
    web3
      .removeLiquidity(tokenBalanceInput)
      .then(() => setTokenBalanceInput(""))
      .then(() =>
        showSuccess(
          `You have removed ${tokenBalanceInput} ${token.name} from the liquidity pool`
        )
      )
      .catch((error) => showError(error.reason));
  };

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <>
        <Text>Select token</Text>
        <Box p="6">
          <Flex justifyContent="space-between">
            <Text>Amount</Text>
            <Flex alignItems="center">
              <Text>Balance: {tokenBalance}</Text>
              {tokenBalanceLoading ? <Spinner size="xs" ml="2" /> : null}
            </Flex>
          </Flex>
          <Flex justifyContent="space-between" py="1">
            <InputGroup size="md" flex="1">
              <Input
                type="number"
                min={0}
                placeholder="0.0"
                value={tokenBalanceInput}
                onChange={(e) => setTokenBalanceInput(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() =>
                    setTokenBalanceInput(
                      Number(tokenLiquidityOfUser).toString()
                    )
                  }
                >
                  MAX
                </Button>
              </InputRightElement>
            </InputGroup>
            <Box ml="2">
              <Dropdown
                items={config.tokens[web3.chain.chainId]}
                defaultSelected={config.tokens[web3.chain.chainId][0]}
                onItemChange={(item) => setToken(item)}
              />
            </Box>
          </Flex>
        </Box>

        <Flex alignItems="center">
          <Text>My liquidity: {tokenLiquidityOfUser}</Text>
          {tokenLiquidityOfUserLoading ? <Spinner size="xs" ml="2" /> : null}
        </Flex>

        <PrimaryButton
          mt={4}
          width="full"
          isLoading={removeLiquidityLoading}
          loadingText="Removing liquidity..."
          disabled={removeLiquidityLoading || tokenBalanceInputError}
          onClick={removeLiquidity}
        >
          Remove Liquidity
        </PrimaryButton>
      </>
    </Flex>
  );
};

export default RemoveLiquidity;
