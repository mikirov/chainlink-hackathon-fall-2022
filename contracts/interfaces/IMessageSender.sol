// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IMessageSender {
    function sendMessage(bytes memory message) external;
}
