import React from "react";
import PrimaryButton from "../components/PrimaryButton";

type DisconnectedProps = { connect: () => void };
const Disconnected: React.FunctionComponent<DisconnectedProps> = ({
  connect,
}) => {
  return (
    <PrimaryButton mt={4} width="full" onClick={connect}>
      Connect Wallet
    </PrimaryButton>
  );
};

export default Disconnected;
