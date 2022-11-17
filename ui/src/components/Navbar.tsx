import React, { ReactNode } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Text,
  useDisclosure,
  useColorModeValue,
  Stack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import PrimaryButton from "./PrimaryButton";
import { Web3Connection } from "../hooks/useWeb3Connection";

const Links = ["Dashboard", "Projects", "Team"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={"#"}
  >
    {children}
  </Link>
);

type NavbarProps = { web3: Web3Connection };
const Navbar: React.FunctionComponent<NavbarProps> = ({ web3 }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        bg={useColorModeValue("gray.100", "gray.900")}
        px={4}
        position="absolute"
        width="full"
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>Bridge</Box>
          </HStack>
          <Flex alignItems={"center"}>
            {web3.connected && web3.account ? (
              <Flex alignItems="center" justifyContent="center">
                <Text mr="4">
                  {ethers.utils.formatEther(web3.balance).substring(0, 5)}{" "}
                  {web3.chain?.nativeCurrency.symbol}
                </Text>
                <Button
                  mr={4}
                  size={"md"}
                  variant={"outline"}
                  colorScheme={"teal"}
                  onClick={(e) => web3.disconnect()}
                >
                  {web3.account.replace(
                    web3.account.substring(4, web3.account.length - 4),
                    "..."
                  )}
                </Button>
              </Flex>
            ) : (
              <PrimaryButton onClick={(e) => web3.connect()} mr={2} size="sm">
                Connect
              </PrimaryButton>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;
