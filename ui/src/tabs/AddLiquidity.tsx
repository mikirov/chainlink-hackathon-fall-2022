import React from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";

import config, { Token } from "../config";
import { UseWeb3 } from "../hooks/useWeb3";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";

type AddLiquidityProps = { web3: UseWeb3 };
const AddLiquidity: React.FunctionComponent<AddLiquidityProps> = ({ web3 }) => {
  const [token, setToken] = React.useState<Token>(config.tokens[0]);
  const [tokenBalance, setTokenBalance] = React.useState("0");
  const [tokenBalanceLoading, setTokenBalanceLoading] = React.useState(false);
  const [tokenBalanceInput, setTokenBalanceInput] = React.useState("");

  const toast = useToast({
    position: "top",
    duration: 3500,
    variant: "subtle",
  });

  const tokenBalanceInputError = React.useMemo(() => {
    const balance = Number(tokenBalanceInput);
    return (
      Number.isNaN(balance) || balance === 0 || balance > Number(tokenBalance)
    );
  }, [tokenBalanceInput]);

  React.useEffect(() => {
    setTokenBalanceLoading(true);

    web3
      .getTokenBalanceOfCurrentAccount(token.address)
      .then((balance) => setTokenBalance(ethers.utils.formatEther(balance)))
      .finally(() => setTokenBalanceLoading(false));
  }, [token, web3.sourceProvider]);

  const addLiquidity = () =>
    web3
      .addLiquidity(token.address, tokenBalanceInput)
      .then(() =>
        toast({
          status: "success",
          title: "The transaction was successfull!",
          description: `You have added ${tokenBalanceInput} ${token.name} to the liquidity pool`,
        })
      )
      .catch((error) =>
        toast({
          status: "error",
          title: "The transaction failed",
          description: error.reason,
        })
      );

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
                  onClick={() => setTokenBalanceInput(tokenBalance)}
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

        <PrimaryButton
          mt={4}
          width="full"
          disabled={tokenBalanceInputError}
          onClick={addLiquidity}
        >
          Add Liquidity
        </PrimaryButton>
      </>
    </Flex>
  );
};

export default AddLiquidity;
