// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "hardhat/console.sol";

import "./interfaces/IBridge.sol";
import "./CrossChain.sol";
import "./LiquidityPool.sol";

import "./CrossChainUpgradable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract Bridge is IBridge, CrossChainUpgradable, OwnableUpgradeable {
    mapping(address => mapping(address => uint256)) public withdrawable;

    // address of the liquidity pool
    ILiquidityPool public liquidityPool;

    function initialize(
        address _tunnel,
        address _liquidityPool
    ) public initializer{
        __CrossChain_init(_tunnel);
        __Ownable_init();
        liquidityPool = ILiquidityPool(_liquidityPool);
    }

    function _unlockBridgedTokenRequest(
        address token,
        address user,
        uint256 amount
    ) private pure returns (bytes memory) {
        return
            abi.encodeWithSelector(
                this.unlockBridgedToken.selector,
                token,
                user,
                amount
            );
    }

    function bridgeToken(address token, uint256 amount) external {
        // Deposit ERC20 to the bridge / LP
        
        _sendMessage(_unlockBridgedTokenRequest(token, msg.sender, amount));
    }

    /// @notice function that withdraws all available bridged amount for a given token held by the caller
    function withdrawBridgedToken(address token) external {
        uint withdrawnAmount = liquidityPool.withdrawBridgedToken(
            msg.sender,
            token
        );

        if (withdrawnAmount <= 0) {
            revert NoBridgeTokenToWithdraw();
        }

        emit BridgedTokenWithdrawn(withdrawnAmount);
    }

    /**
     * Below functions are called from the Tunnel on the other chain.
     * They must be public/external
     */

    /// @notice function that bridges token amount for a given user between 2 chains
    /// it tries automatically to send bridged tokens to user address
    /// It's a cross-chain call, so atomic functionality is not possible and the transaction must not fail
    /// otherwise the new unlocked bridge token amount will be lost
    function unlockBridgedToken(
        address token,
        address user,
        uint256 amount
    ) public onlyTunnel {
        liquidityPool.addBridgedToken(user, token, amount);

        // make sure the transaction will never revert
        try liquidityPool.withdrawBridgedToken(user, token) returns (
            uint amount
        ) {
            emit BridgedTokenWithdrawn(amount);
        } catch {}
    }
}
