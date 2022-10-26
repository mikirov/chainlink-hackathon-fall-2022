import React from "react";
import { Box, Flex } from "@chakra-ui/react";

import Navbar from "./components/Navbar";
import Connected from "./pages/Connected";
import Disconnected from "./pages/Disconnected";
import useWeb3Connection from "./hooks/useWeb3Connection";

const App: React.FunctionComponent = () => {
  const web3 = useWeb3Connection();

  return (
    <Box height="full">
      <Navbar web3={web3} />

      <Flex
        maxW="xl"
        margin="auto"
        height="full"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        {web3.connected ? (
          <Connected />
        ) : (
          <Disconnected connect={web3.connect} />
        )}
      </Flex>
    </Box>
  );
};

export default App;
