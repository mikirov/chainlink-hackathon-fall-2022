// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

contract Crosschain {
    address public bridge;

    event MessageSent(bytes);

    constructor() {}

    function execute(bytes calldata message) external {
        emit MessageSent(message);
    }

    function setBridge(address _bridge) external {
        bridge = _bridge;
    }

    /**
     * Function called only from Bridge Oracle
     */
    function bridgeCall(bytes memory message) external {
        address(bridge).delegatecall(message);
    }
}
