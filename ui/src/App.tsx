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
        justifyContent="center"
        flexDirection="column"
      >
        <Box padding="8" boxShadow="dark-lg">
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
              <TabPanel>
                <p>Add Liquidity</p>
              </TabPanel>
              <TabPanel>
                <p>Remove Liquidity</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
