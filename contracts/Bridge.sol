// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

// import "hardhat/console.sol";

// import "forge-std/console.sol";

import "./interfaces/IBridge.sol";
import "./LiquidityPool.sol";
import "./TokenMapping.sol";
import "./CrossChainUpgradable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Bridge is IBridge, CrossChainUpgradable, OwnableUpgradeable {
    mapping(address => mapping(address => uint256)) public withdrawable;

    event BridgedTokenWithdrawn(uint256 amount);

    error NoBridgeTokenToWithdraw();
    error TokenNotSupported(address token);

    // address of the liquidity pool
    LiquidityPool public liquidityPool;

    TokenMapping public tokenMapping;

    function initialize(
        address _tunnel,
        address _liquidityPool,
        address _tokenMapping
    ) public initializer{
        __CrossChain_init(_tunnel);
        __Ownable_init();
        liquidityPool = LiquidityPool(_liquidityPool);
        tokenMapping = TokenMapping(_tokenMapping);
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

    function bridgeToken(address sourceToken, uint256 amount) external {
        address destinationToken = tokenMapping.tokenMap(sourceToken);

        /// @notice if the destination token is address(0) it is not supported, we revert
        if(destinationToken == address(0)) {
            revert TokenNotSupported(sourceToken);
        }

        /// @dev Deposit ERC20 to the bridge and then directly from the bridge to the LP
        /// the way the bridge earns commission is by taking LP rewards from the LP like other LP providers
        bool status = IERC20(sourceToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(status);

        IERC20(sourceToken).approve(address(liquidityPool), amount);
        liquidityPool.addLiquidity(sourceToken, amount);

        /// @dev we send the request to the other chain with the address of the destination token
        _sendMessage(_unlockBridgedTokenRequest(destinationToken, msg.sender, amount));
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
        } catch {
            // do nothing
        }
    }
}
