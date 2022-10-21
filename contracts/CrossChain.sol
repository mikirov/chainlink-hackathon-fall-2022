// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "fx-portal/contracts/lib/Address.sol";

import "./interfaces/IMessageReceiver.sol";
import "./interfaces/IMessageSender.sol";
import "hardhat/console.sol";

contract CrossChain is IMessageReceiver {
    IMessageSender public tunnel;

    modifier onlyTunnel() {
        require(msg.sender == address(tunnel), "Not a tunnel");
        _;
    }

    constructor(address _tunnel) {
        tunnel = IMessageSender(_tunnel);
    }

    /// @notice send requests to other chain
    function _sendMessage(bytes memory message) internal {
        console.log("_sendMessage", message.length);
        tunnel.sendMessage(message);
    }

    /// @notice receive requests from other chain
    function receiveMessage(bytes memory message) external onlyTunnel {
        Address.functionDelegateCall(address(this), message);
    }
}
