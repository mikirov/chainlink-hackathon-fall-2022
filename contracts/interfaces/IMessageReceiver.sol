// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IMessageReceiver {
    function receiveMessage(bytes memory message) external;
}
