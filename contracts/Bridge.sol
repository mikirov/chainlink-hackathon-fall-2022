// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IBridge.sol";
import "./CrossChain.sol";
import "./LiquidityPool.sol";

contract Bridge is IBridge, CrossChain {
    // address of the liquidity pool
    LiquidityPool public liquidityPool;

    event BridgedTokenWithdrawn(uint amount);

    error NoBridgeTokenToWithdraw();

    constructor(address _tunnel, address _liquidityPool) CrossChain(_tunnel) {
        liquidityPool = LiquidityPool(liquidityPool);
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
