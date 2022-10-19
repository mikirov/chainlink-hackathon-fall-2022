// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

/// @title Interface for the liquidity pool
interface ILiquidityPool {
    /// @notice method that returns the current balance of the liquidity pool on this chain
    function getLiquidityOf(address token) external view returns (uint256);

    /// @notice method that deposits tokens to the liquidity pool
    function deposit(address token, uint256 amount) external;

    /// @notice method that withdraws tokens from the liquidity pool
    function withdraw(address token, uint256 amount) external;

    /// @notice unlock specified amount of token from the liquidity pool to the user address on the target chain
    function unlockTokenTo(
        address token,
        address user,
        uint256 amount
    ) external;
}