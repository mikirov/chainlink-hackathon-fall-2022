import React from "react";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import useWeb3 from "../hooks/useWeb3";
import Bridge from "../tabs/Bridge";
import AddLiquidity from "../tabs/AddLiquidity";
import RemoveLiquidity from "../tabs/RemoveLiquidity";

type ConnectedProps = {};
const Connected: React.FunctionComponent<ConnectedProps> = () => {
  const web3 = useWeb3();

  return (
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
          <TabPanel pt={8}>
            <AddLiquidity web3={web3} />
          </TabPanel>
          <TabPanel pt={8}>
            <RemoveLiquidity web3={web3} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Connected;
