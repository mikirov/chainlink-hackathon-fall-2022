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
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import { UseWeb3 } from "../hooks/useWeb3";
import useNotification from "../hooks/useNotification";

type RemoveLiquidityProps = { web3: UseWeb3 };
const RemoveLiquidity: React.FunctionComponent<RemoveLiquidityProps> = ({
  web3,
}) => {
  const [token, setToken] = React.useState<Token>(config.tokens[0]);
  const [tokenBalance, setTokenBalance] = React.useState("0");
  const [tokenBalanceInput, setTokenBalanceInput] = React.useState("");
  const [tokenLiquidityOfUser, setTokenLiquidityOfUser] = React.useState("0");
  const [tokenBalanceLoading, setTokenBalanceLoading] = React.useState(false);
  const [tokenLiquidityOfUserLoading, setTokenLiquidityOfUserLoading] =
    React.useState(false);
  const [removeLiquidityLoading, setRemoveLiquidityLoading] =
    React.useState(false);

  const { showError, showSuccess } = useNotification();

  const tokenBalanceInputError = React.useMemo(() => {
    const balance = Number(tokenBalanceInput);
    return (
      Number.isNaN(balance) ||
      balance === 0 ||
      balance > Number(tokenLiquidityOfUser)
    );
  }, [tokenBalanceInput]);

  console.log("remove");

  React.useEffect(() => {
    fetchTokenBalance_();
    fetchTokenLiquidityOfUser_();
  }, [token]);

  const fetchTokenLiquidityOfUser_ = () => {
    setTokenLiquidityOfUserLoading(true);

    web3
      .getLiquidityOfUser(token.address)
      .then((balance) =>
        setTokenLiquidityOfUser(
          Number(ethers.utils.formatEther(balance)).toFixed(0)
        )
      )
      .finally(() => setTokenLiquidityOfUserLoading(false));
  };

  const fetchTokenBalance_ = () => {
    setTokenBalanceLoading(true);

    web3
      .getTokenBalanceOfCurrentAccount(token.address)
      .then((balance) =>
        setTokenBalance(Number(ethers.utils.formatEther(balance)).toFixed(0))
      )
      .finally(() => setTokenBalanceLoading(false));
  };

  const removeLiquidity = () => {
    setRemoveLiquidityLoading(true);

    web3
      .removeLiquidity(token.address, tokenBalanceInput)
      .then(() => fetchTokenBalance_())
      .then(() => fetchTokenLiquidityOfUser_())
      .then(() => setTokenBalanceInput(""))
      .finally(() => setRemoveLiquidityLoading(false))
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
