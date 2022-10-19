// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface ICrossChain {
    function execute(bytes memory message) external;
}