// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "hardhat/console.sol";

import "./interfaces/IBridge.sol";
import "./interfaces/ICrossChain.sol";
import "./interfaces/IERC20.sol";
import "./LiquidityPool.sol";

// TODO: perhaps we want to be multi-chain and have a mapping of chainId => bridge address instead?
uint256 constant ETHEREUM_CHAIN_ID = 1;
uint256 constant POLYGON_CHAIN_ID = 137;

contract Bridge is IBridge{
    mapping(address => mapping(address => uint256)) public withdrawable;

    // address of the liquidity pool
    LiquidityPool public liquidityPool;
    // address of the Root contract
    ICrossChain public ethereum;
    // address of the Child contract
    ICrossChain public polygon;

    constructor(
        address _ethereum,
        address _polygon,
        bytes32 salt
    ) {
        liquidityPool = new LiquidityPool{salt: salt}(msg.sender, address(this));
        ethereum = ICrossChain(_ethereum);
        polygon = ICrossChain(_polygon);
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

    function bridgeToPolygon(address token, uint256 amount)
        external
        onlyChain(ETHEREUM_CHAIN_ID)
    {
        polygon.execute(_unlockBridgedTokenRequest(token, msg.sender, amount));
    }

    function bridgeToEthereum(address token, uint256 amount)
        external
        onlyChain(POLYGON_CHAIN_ID)
    {
        ethereum.execute(_unlockBridgedTokenRequest(token, msg.sender, amount));
    }

    // TODO: add access control
    function unlockBridgedToken(
        address token,
        address user,
        uint256 amount
    ) external {
        console.log("Crosschain bridge", token, user, amount);
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
