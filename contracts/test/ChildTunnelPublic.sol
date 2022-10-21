// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "../tunnel/ChildTunnel.sol";

contract ChildTunnelPublic is ChildTunnel {
    uint256 stateId;

    function processMessageFromRootTunnel(bytes memory message) external {
        stateId++;

        _processMessageFromRoot(stateId, msg.sender, message);
    }
}
