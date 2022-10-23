// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "hardhat/console.sol";

import "./interfaces/IBridge.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ILiquidityPool.sol";

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

    /**
     * Below functions are called from the Tunnel on the other chain.
     * They must be public/external
     */
    function unlockBridgedToken(
        address token,
        address user,
        uint256 amount
    ) public onlyTunnel {
        if(liquidityPool.totalLiquidity(token) >= amount) {
            liquidityPool.unlockTokenTo(token, user, amount);
        } else {
            // If there is not enough liquidity, we add the tokens to the user's funds to receive in the future
            liquidityPool.addToFunds(token, user, amount);
        }
    }
}
