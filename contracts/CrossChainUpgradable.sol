// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "fx-portal/contracts/lib/Address.sol";

import "./interfaces/IMessageReceiver.sol";
import "./interfaces/IMessageSender.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CrossChainUpgradable is Initializable, IMessageReceiver {
    IMessageSender public tunnel;

    modifier onlyTunnel() {
        require(msg.sender == address(tunnel), "Not a tunnel");
        _;
    }

    function __CrossChain_init(address _tunnel) internal onlyInitializing
    {
        tunnel = IMessageSender(_tunnel);
    }

    /// @notice send requests to other chain
    function _sendMessage(bytes memory message) internal {
        tunnel.sendMessage(message);
    }

    /// @notice receive requests from other chain
    function receiveMessage(bytes memory message) external onlyTunnel {
        Address.functionDelegateCall(address(this), message);
    }
}
