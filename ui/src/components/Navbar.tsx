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
import useWeb3, { UseWeb3 } from "../hooks/useWeb3";
import PrimaryButton from "./PrimaryButton";

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

type NavbarProps = { web3: UseWeb3 };
const Navbar: React.FunctionComponent<NavbarProps> = ({ web3 }) => {
  const { connect, disconnect, connected, account, balance } = web3;
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
            {connected && account ? (
              <Flex alignItems="center" justifyContent="center">
                <Text mr="4">
                  {ethers.utils.formatEther(balance).substring(0, 5)} ETH
                </Text>
                <Button
                  mr={4}
                  size={"md"}
                  variant={"outline"}
                  colorScheme={"teal"}
                  onClick={(e) => disconnect()}
                >
                  {account.replace(
                    account.substring(4, account.length - 4),
                    "..."
                  )}
                </Button>
              </Flex>
            ) : (
              <PrimaryButton onClick={(e) => connect()} mr={2} size="sm">
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
