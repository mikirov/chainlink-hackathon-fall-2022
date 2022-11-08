import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React from "react";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import config from "../config";
import { UseWeb3 } from "../hooks/useWeb3";

type FacetProps = {
  web3: UseWeb3;
};
const Facet: React.FunctionComponent<FacetProps> = ({ web3 }) => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Text>Get fee test tokens</Text>
      <Flex justifyContent="space-between" py="1" width="full">
        <InputGroup size="md" flex="1">
          <Input
            type="number"
            min={0}
            placeholder="0.0"
            // value={tokenBalanceInput}
            // onChange={(e) => setTokenBalanceInput(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              //   onClick={() =>
              //     setTokenBalanceInput(Number(tokenLiquidityOfUser).toString())
              //   }
            >
              MAX
            </Button>
          </InputRightElement>
        </InputGroup>
        <Box ml="2">
          <Dropdown
            items={config.tokens[web3.chain.chainId]}
            defaultSelected={config.tokens[web3.chain.chainId][0]}
            // onItemChange={(item) => setToken(item)}
          />
        </Box>
      </Flex>
      <PrimaryButton
        mt={4}
        width="full"
        // isLoading={addLiquidityLoading}
        loadingText="Adding liquidity..."
        // disabled={addLiquidityLoading || tokenBalanceInputError}
        // onClick={addLiquidity}
      >
        Receive tokens
      </PrimaryButton>
    </Flex>
  );
};

export default Facet;
