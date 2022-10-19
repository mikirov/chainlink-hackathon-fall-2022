// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

uint256 constant ETHEREUM_CHAIN_ID = 1;
uint256 constant POLYGON_CHAIN_ID = 137;

interface ICrossChain {
    function execute(bytes memory message) external;
}

interface ILiquidityPool {
    function getLiquidityOf(address token) external view returns (uint256);

    function transferTokenTo(
        address token,
        address user,
        uint256 amount
    ) external;
}

contract Bridge {
    mapping(address => mapping(address => uint256)) public withdrawable;

    // address of the liquidity pool
    ILiquidityPool public liquidityPool;
    // address of the Root contract
    ICrossChain public ethereum;
    // address of the Child contract
    ICrossChain public polygon;

    constructor(
        address _liquidityPool,
        address _ethereum,
        address _polygon
    ) {
        liquidityPool = ILiquidityPool(_liquidityPool);
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

    /**
     * Function that adds deposited tokens to the liquidity
     */
    function _bridge(IERC20 token, uint256 amount) private {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");

        token.transferFrom(msg.sender, address(liquidityPool), amount);
    }

    function bridgeToPolygon(address token, uint256 amount)
        external
    {
        // _bridge(IERC20(token), amount);

        polygon.execute(_unlockBridgedTokenRequest(token, msg.sender, amount));
    }

    function bridgeToEthereum(address token, uint256 amount)
        external
    {
        // _bridge(IERC20(token), amount);

        ethereum.execute(_unlockBridgedTokenRequest(token, msg.sender, amount));
    }

    // onlyRoot or onlyChild
    function unlockBridgedToken(
        address token,
        address user,
        uint256 amount
    ) external {
        console.log("Crosschain bridge", token, user, amount);
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
