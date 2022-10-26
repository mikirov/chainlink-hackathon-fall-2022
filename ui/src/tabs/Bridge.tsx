import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  Select,
  Text,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { ArrowForwardIcon } from "@chakra-ui/icons";

import config from "../config";
import { UseWeb3 } from "../hooks/useWeb3";
import Dropdown, { DropdownItem } from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";

type BridgeProps = {
  web3: UseWeb3;
};
const Bridge: React.FunctionComponent<BridgeProps> = ({ web3 }) => {
  const chainItems = config.supportedChains.map<DropdownItem>((chain) => ({
    id: chain.chainId,
    name: chain.chainName,
    image: chain.iconUrls[0],
  }));

  const changeSourceChain = (id: string) => {
    web3.switchChain(id);
  };

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Text>Select destination</Text>
      <Flex alignItems="center" padding="6">
        <Dropdown
          items={chainItems}
          defaultSelected={chainItems[0]}
          onItemChange={({ id }) =>
            changeSourceChain(ethers.utils.hexValue(id))
          }
        />

        <ArrowForwardIcon mx="4" />

        <Dropdown items={chainItems} defaultSelected={chainItems[1]} />
      </Flex>

      <Text>Select token</Text>
      <Box p="6">
        <Flex justifyContent="space-between">
          <Text>Amount</Text>
          <Text>Balance: 10</Text>
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
            <Select placeholder="WETH">
              <option value="WETH">WETH</option>
            </Select>
          </Box>
        </Flex>
      </Box>

      <PrimaryButton mt={4} width="full">
        Transfer
      </PrimaryButton>
    </Flex>
  );
};

export default Bridge;
