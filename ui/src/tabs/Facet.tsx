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
import React, { useState } from "react";
import shallow from "zustand/shallow";
import Dropdown from "../components/Dropdown";
import PrimaryButton from "../components/PrimaryButton";
import config from "../config";
import useNotification from "../hooks/useNotification";
import { UseWeb3 } from "../hooks/useWeb3";
import useProtocolStore from "../store";

type FacetProps = {
  web3: UseWeb3;
};
const Facet: React.FunctionComponent<FacetProps> = ({ web3 }) => {
  const [loading, setLoading] = useState(false);

  const [tokenBalance, tokenBalanceLoading] = useProtocolStore(
    (state) => [state.tokenBalance, state.tokenBalanceLoading],
    shallow
  );

  const { showError, showSuccess } = useNotification();
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Text>Get free test tokens</Text>
      <Flex alignItems="center">
        <Text>Balance: {tokenBalance}</Text>
        {tokenBalanceLoading ? <Spinner size="xs" ml="2" /> : null}
      </Flex>
      <PrimaryButton
        mt={4}
        width="full"
        isLoading={loading}
        loadingText="Sending tokens..."
        disabled={loading}
        onClick={async () => {
          setLoading(true);

          await web3
            .mintTestTokens(1000)
            .then(() => web3.fetchTokenBalance())
            .then(() => showSuccess(`You have received 1000 tokens`))
            .catch((error) => showError(error.reason))
            .finally(() => setLoading(false));
        }}
      >
        Receive 1000 tokens
      </PrimaryButton>
    </Flex>
  );
};

export default Facet;
