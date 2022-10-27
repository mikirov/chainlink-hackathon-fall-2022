import React from "react";
import { Box, Flex } from "@chakra-ui/react";

import Navbar from "./components/Navbar";
import Connected from "./pages/Connected";
import Disconnected from "./pages/Disconnected";
import useWeb3Connection from "./hooks/useWeb3Connection";
import useNotification from "./hooks/useNotification";

const App: React.FunctionComponent = () => {
  const web3 = useWeb3Connection();
  const { showError } = useNotification();

  React.useEffect(() => {
    web3.error && showError(web3.error);
  }, [web3.error]);

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
        {!web3.error && web3.connected ? (
          <Connected />
        ) : (
          <Disconnected connect={web3.connect} />
        )}
      </Flex>
    </Box>
  );
};

export default App;
