// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "hardhat/console.sol";

import "./interfaces/IBridge.sol";
import "./CrossChain.sol";
import "./interfaces/IERC20.sol";
import "./LiquidityPool.sol";

contract Bridge is IBridge, CrossChain {
    mapping(address => mapping(address => uint256)) public withdrawable;

    // address of the liquidity pool
    LiquidityPool public liquidityPool;

    constructor(
        address _tunnel,
        bytes32 salt
    ) CrossChain(_tunnel){
        liquidityPool = new LiquidityPool{salt: salt}(msg.sender, address(this));
    }

    modifier onlyChain(uint256 chainId) {
        uint256 current;

        assembly {
            current := chainid()
        }

        require(current == chainId, "Not available on this chain");
        _;
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
        withdrawable[user][token] = amount;
        // console.log("Crosschain bridge", token, user, amount);
        // console.log("Message data: ", msg.data);
        // uint withdrawAmount = amount;
        // uint tokenLiquidity = liquidityPool.getLiquidityOf(token);

        // if (tokenLiquidity <= amount) {
        //     withdrawAmount = tokenLiquidity;
        // }

        // withdrawable[user][token] += amount - withdrawAmount;
        // liquidityPool.transferTokenTo(token, user, withdrawAmount);
        // rewards???
    }
}
