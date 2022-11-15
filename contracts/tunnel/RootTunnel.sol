// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {FxBaseRootTunnel} from "fx-portal/contracts/tunnel/FxBaseRootTunnel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IMessageReceiver.sol";
import "../interfaces/IMessageSender.sol";

address constant GOERLI_CHECKPOINT_MANAGER = 0x2890bA17EfE978480615e330ecB65333b880928e;
address constant GOERLI_FX_ROOT = 0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA;
address constant MAINNET_CHECKPOINT_MANAGER = 0x86E4Dc95c7FBdBf52e33D563BbDB00823894C287;
address constant MAINNET_FX_ROOT = 0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2;

contract RootTunnel is FxBaseRootTunnel, IMessageSender, Ownable {
    bytes public latestData;
    IMessageReceiver public parent;

    modifier onlyParent() {
        require(msg.sender == address(parent), "Not a parent");
        _;
    }

    constructor() FxBaseRootTunnel(GOERLI_CHECKPOINT_MANAGER, GOERLI_FX_ROOT) {}

    function setParent(address _parent) external onlyOwner {
        parent = IMessageReceiver(_parent);
    }

    function _processMessageFromChild(bytes memory data) internal override {
        latestData = data;

        // parent.receiveMessage(data);
    }

    function sendMessage(bytes memory message) external virtual onlyParent {
        _sendMessageToChild(message);
    }
}
