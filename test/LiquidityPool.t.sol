pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../contracts/LiquidityPool.sol";
import "forge-std/console.sol";

contract LiquidityPoolTest is Test
{
    address owner;
    address ZERO_ADDRESS = address(0);
    address spender = address(1);
    address user = address(2);
    address token1 = address(3);
    address token2 = address(4);
    address bridge = address(5);

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant LP_PROVIDER_ROLE = keccak256("LP_PROVIDER_ROLE");

    LiquidityPool LiquidityPoolTest;
    function setUp() public
    {
        owner = address(this);
        LiquidityPoolTest = new LiquidityPool(address(this));

    }

    function testinitialState() public {
        assertEq(LiquidityPoolTest.hasRole(DEFAULT_ADMIN_ROLE, address(this)), true);
        assertEq(LiquidityPoolTest.hasRole(PAUSER_ROLE, address(this)), true);
    }

    function testRevertOnNonOwnerSetBridge() public
    {
        vm.expectRevert();
        vm.prank(user);
        LiquidityPoolTest.setBridge(bridge);
    }
    function testSetBridge() public
    {
        LiquidityPoolTest.setBridge(bridge);
        assertEq(LiquidityPoolTest.hasRole(BRIDGE_ROLE, bridge), true);
    }

    function testDeposit() public
    {

    }
}