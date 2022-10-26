import React from "react";
import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import Navbar from "./components/Navbar";
import Bridge from "./pages/Bridge";
import useWeb3 from "./hooks/useWeb3";
import AddLiquidity from "./pages/AddLiquidity";
import PrimaryButton from "./components/PrimaryButton";

function App() {
  const web3 = useWeb3();

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
        <Box padding="8" boxShadow="dark-lg">
          {web3.connected ? (
            <Tabs variant="enclosed" align="center">
              <TabList>
                <Tab>Bridge</Tab>
                <Tab>Add Liquidity</Tab>
                <Tab>Remove Liquidity</Tab>
              </TabList>
              <TabPanels>
                <TabPanel pt={8}>
                  <Bridge web3={web3} />
                </TabPanel>
                <TabPanel pt={8}>
                  <AddLiquidity web3={web3} />
                </TabPanel>
                <TabPanel pt={8}>
                  <p>Remove Liquidity</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <PrimaryButton mt={4} width="full" onClick={() => web3.connect()}>
              Connect Wallet
            </PrimaryButton>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
