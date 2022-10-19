// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

/// @title interface that is used for bidirectional communication between two chains
interface ICrossChain {
    function execute(bytes memory message) external;
}