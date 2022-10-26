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

export type DropdownItem = {
  id: number | string;
  name: string;
  image?: string;
};
type DropdownProps = {
  items: DropdownItem[];
  defaultSelected: DropdownItem;
  onItemChange?: (item: any) => void;
};
const Dropdown: React.FunctionComponent<DropdownProps> = ({
  items,
  defaultSelected,
  onItemChange = () => {},
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
            {selected.image && <Image src={selected.image} w="8" mr="2" />}
            <Text>{selected.name}</Text>
          </Flex>
        </MenuButton>
        <MenuList>
          {items
            .filter((item) => item.id !== selected.id)
            .map((item) => (
              <MenuItem
                key={item.id}
                onClick={(e) => {
                  setSelected(item);
                  onItemChange(item);
                }}
              >
                {item.image && <Image src={item.image} w="8" mr="4" />}{" "}
                {item.name}
              </MenuItem>
            ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Dropdown;
