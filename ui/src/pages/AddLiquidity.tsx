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

  React.useEffect(() => {
    setTokenBalanceLoading(true);
    web3
      .getTokenBalanceOfCurrentAccount(token.address)
      .then((balance) => setTokenBalance(ethers.utils.formatEther(balance)))
      .finally(() => setTokenBalanceLoading(false));
  }, [token, web3.connected, web3.sourceProvider]);

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
              <Input type="number" min={0} placeholder="0.0" />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => {}}>
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

        {web3.connected ? (
          <PrimaryButton mt={4} width="full">
            Add Liquidity
          </PrimaryButton>
        ) : (
          <PrimaryButton mt={4} width="full" onClick={() => web3.connect()}>
            Connect Wallet
          </PrimaryButton>
        )}
      </>
    </Flex>
  );
};

export default AddLiquidity;
