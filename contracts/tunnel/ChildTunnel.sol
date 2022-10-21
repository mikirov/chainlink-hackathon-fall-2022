// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {FxBaseChildTunnel} from "fx-portal/contracts/tunnel/FxBaseChildTunnel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IMessageReceiver.sol";
import "../interfaces/IMessageSender.sol";

address constant MUMBAI_FX_CHILD = 0xCf73231F28B7331BBe3124B907840A94851f9f11;
address constant MAINNET_FX_CHILD = 0x8397259c983751DAf40400790063935a11afa28a;

contract ChildTunnel is FxBaseChildTunnel, IMessageSender, Ownable {
    uint256 public latestStateId;
    address public latestRootMessageSender;
    bytes public latestData;

    IMessageReceiver public parent;

    modifier onlyParent() {
        require(msg.sender == address(parent), "Not a parent");
        _;
    }

    constructor() FxBaseChildTunnel(MUMBAI_FX_CHILD) {}

    function setParent(IMessageReceiver _parent) external onlyOwner {
        parent = _parent;
    }

    function _processMessageFromRoot(
        uint256 stateId,
        address sender,
        bytes memory data
    ) internal override validateSender(sender) {
        latestStateId = stateId;
        latestRootMessageSender = sender;
        latestData = data;

        parent.receiveMessage(data);
    }

    function sendMessage(bytes memory message) external onlyParent {
        _sendMessageToRoot(message);
    }
}
