import React, { PropsWithChildren } from "react";
import { Button, type ButtonProps } from "@chakra-ui/react";

type PrimaryButtonProps = {} & ButtonProps & PropsWithChildren;
const PrimaryButton: React.FunctionComponent<PrimaryButtonProps> = (props) => {
  return (
    <Button colorScheme="teal" variant="solid" size="md" {...props}>
      {props.children}
    </Button>
  );
};

export default PrimaryButton;
