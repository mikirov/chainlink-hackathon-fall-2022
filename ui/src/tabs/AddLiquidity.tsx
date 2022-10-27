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

type AddLiquidityProps = { web3: UseWeb3 };
const AddLiquidity: React.FunctionComponent<AddLiquidityProps> = ({ web3 }) => {
  const [
    token,
    tokenBalance,
    tokenLiquidityOfUser,
    tokenBalanceLoading,
    addLiquidityLoading,
    tokenLiquidityOfUserLoading,
    setToken,
  ] = useProtocolStore(
    (state) => [
      state.token,
      state.tokenBalance,
      state.tokenLiquidityOfUser,
      state.tokenBalanceLoading,
      state.addLiquidityLoading,
      state.tokenLiquidityOfUserLoading,
      state.setToken,
    ],
    shallow
  );

  const [tokenBalanceInput, setTokenBalanceInput] = React.useState("");

  const { showError, showSuccess } = useNotification();

  console.log("add");

  const tokenBalanceInputError = React.useMemo(() => {
    const balance = Number(tokenBalanceInput);
    return (
      Number.isNaN(balance) || balance === 0 || balance > Number(tokenBalance)
    );
  }, [tokenBalanceInput]);

  const addLiquidity = () => {
    web3
      .addLiquidity(tokenBalanceInput)
      .then(() => setTokenBalanceInput(""))
      .then(() =>
        showSuccess(
          `You have added ${tokenBalanceInput} ${token.name} to the liquidity pool`
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
                    setTokenBalanceInput(Number(tokenBalance).toString())
                  }
                >
                  MAX
                </Button>
              </InputRightElement>
            </InputGroup>
            <Box ml="2">
              <Dropdown
                items={config.tokens}
                defaultSelected={config.tokens[0]}
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
          isLoading={addLiquidityLoading}
          loadingText="Adding liquidity..."
          disabled={addLiquidityLoading || tokenBalanceInputError}
          onClick={addLiquidity}
        >
          Add Liquidity
        </PrimaryButton>
      </>
    </Flex>
  );
};

export default AddLiquidity;
