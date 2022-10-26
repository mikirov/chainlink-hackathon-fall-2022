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
import { ethers } from "ethers";

import config, { Token } from "../config";
import { UseWeb3 } from "../hooks/useWeb3";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import useNotification from "../hooks/useNotification";

type AddLiquidityProps = { web3: UseWeb3 };
const AddLiquidity: React.FunctionComponent<AddLiquidityProps> = ({ web3 }) => {
  const [token, setToken] = React.useState<Token>(config.tokens[0]);
  const [tokenBalance, setTokenBalance] = React.useState("0");
  const [tokenBalanceInput, setTokenBalanceInput] = React.useState("");
  const [tokenLiquidityOfUser, setTokenLiquidityOfUser] = React.useState("");
  const [tokenBalanceLoading, setTokenBalanceLoading] = React.useState(false);
  const [addLiquidityLoading, setAddLiquidityLoading] = React.useState(false);

  const { showError, showSuccess } = useNotification();

  const tokenBalanceInputError = React.useMemo(() => {
    const balance = Number(tokenBalanceInput);
    return (
      Number.isNaN(balance) || balance === 0 || balance > Number(tokenBalance)
    );
  }, [tokenBalanceInput]);

  React.useEffect(() => {
    web3
      .getLiquidityOfToken(token.address)
      .then((balance) =>
        setTokenLiquidityOfUser(
          Number(ethers.utils.formatEther(balance)).toFixed(0)
        )
      );
  });

  React.useEffect(() => {
    _updateTokenBalance();
  }, [token, web3.sourceProvider]);

  const _updateTokenBalance = () => {
    setTokenBalanceLoading(true);

    web3
      .getTokenBalanceOfCurrentAccount(token.address)
      .then((balance) =>
        setTokenBalance(Number(ethers.utils.formatEther(balance)).toFixed(0))
      )
      .finally(() => setTokenBalanceLoading(false));
  };

  const addLiquidity = () => {
    setAddLiquidityLoading(true);

    web3
      .addLiquidity(token.address, tokenBalanceInput)
      .then(() => _updateTokenBalance())
      .then(() => setTokenBalanceInput(""))
      .then(() =>
        showSuccess(
          `You have added ${tokenBalanceInput} ${token.name} to the liquidity pool`
        )
      )
      .catch((error) => showError(error.reason))
      .finally(() => setAddLiquidityLoading(false));
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

        <Text>My liquidity: {tokenLiquidityOfUser}</Text>

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
