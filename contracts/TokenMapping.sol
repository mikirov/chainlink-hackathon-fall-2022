// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TokenMapping
/// @notice This contract maps the child token to the root token
contract TokenMapping is Ownable
{
    /// @notice mapping from source token to destination token address
    mapping(address => address) public tokenMap;

    function addToMapping(address sourceToken, address destinationMapping) external onlyOwner {
        tokenMap[sourceToken] = destinationMapping;
    }

    function removeFromMapping(address sourceToken) external onlyOwner {
        delete tokenMap[sourceToken];
    }
}

