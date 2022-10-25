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
import { ArrowForwardIcon } from "@chakra-ui/icons";

import { UseWeb3 } from "../hooks/useWeb3";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";

type BridgeProps = {
  web3: UseWeb3;
};
const Bridge: React.FunctionComponent<BridgeProps> = ({ web3 }) => {
  const supportedNetworks = [
    { id: 1, title: "Ethereum", image: "/ethereum.svg" },
    { id: 2, title: "Polygon", image: "/polygon.png" },
  ];

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Text>Select destination</Text>
      <Flex alignItems="center" padding="6">
        <Dropdown
          items={supportedNetworks}
          defaultSelected={supportedNetworks[0]}
        />

        <ArrowForwardIcon mx="4" />

        <Dropdown
          items={supportedNetworks}
          defaultSelected={supportedNetworks[1]}
        />
      </Flex>

      <Text>Select token</Text>
      <Box p="6">
        <Flex justifyContent="space-between">
          <Text>Amount</Text>
          <Text>Balance: 10</Text>
        </Flex>
        <Flex justifyContent="space-between" py="1">
          <InputGroup size="md" flex="1">
            <Input pr="4.5rem" type="text" placeholder="0.0" />
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

      {web3.connected ? (
        <PrimaryButton mt={4} width="full">
          Transfer
        </PrimaryButton>
      ) : (
        <PrimaryButton mt={4} width="full" onClick={() => web3.connect()}>
          Connect Wallet
        </PrimaryButton>
      )}
    </Flex>
  );
};

export default Bridge;
