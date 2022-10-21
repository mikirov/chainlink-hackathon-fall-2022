// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

/// @title Interface for the liquidity pool
interface ILiquidityPool {
    /// @notice method that returns the current balance of the liquidity pool on this chain
    function getLiquidityOf(address token) external view returns (uint256);

    /// @notice function that permits and deposits an ERC20 token to the contract
    function depositPermit(
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /// @notice function that deposits an ERC20 token to the contract
    function deposit(address token, uint256 amount) external;

    /// @notice function that returns the current balance of token for a user
    function getBalanceOf(address user, address token)
        external
        view
        returns (uint256);

    /// @notice method that withdraws tokens from the liquidity pool
    function withdraw(address token, uint256 amount) external;

    /// @notice unlock specified amount of token from the liquidity pool to the user address on the target chain
    /// method is meant to be called by the bridge contract
    function unlockTokenTo(
        address token,
        address user,
        uint256 amount
    ) external;
}