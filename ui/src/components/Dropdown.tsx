import React from "react";
import {
  Box,
  Flex,
  Text,
  Menu,
  Image,
  Button,
  MenuItem,
  MenuList,
  MenuButton,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

type DropdownItem = { id: number; title: string; image: string };
type DropdownProps = {
  items: DropdownItem[];
  defaultSelected: DropdownItem;
};
const Dropdown: React.FunctionComponent<DropdownProps> = ({
  items,
  defaultSelected,
}) => {
  const [selected, setSelected] = React.useState(defaultSelected);

  return (
    <Box width="full">
      <Menu matchWidth>
        <MenuButton
          p={2}
          width="full"
          as={Button}
          position="relative"
          rightIcon={<ChevronDownIcon />}
        >
          <Flex width="full" height="full" alignItems="center">
            <Image src={selected.image} w="8" mr="2" />
            <Text>{selected.title}</Text>
          </Flex>
        </MenuButton>
        <MenuList>
          {items
            .filter((item) => item.id !== selected.id)
            .map((item) => (
              <MenuItem key={item.id} onClick={(e) => setSelected(item)}>
                <Image src={item.image} w="8" mr="4" /> {item.title}
              </MenuItem>
            ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Dropdown;
