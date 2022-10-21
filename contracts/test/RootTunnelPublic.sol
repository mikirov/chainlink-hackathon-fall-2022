// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "../tunnel/RootTunnel.sol";

contract RootTunnelPublic is RootTunnel {
    event MessageSent(bytes message);

    function processMessageFromChildTunnel(bytes memory data) external {
        _processMessageFromChild(data);
    }

    function sendMessage(bytes memory message) external override {
        emit MessageSent(message);
    }
}
