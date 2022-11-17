pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../contracts/LiquidityPool.sol";
import "../contracts/test/TestBridgedToken.sol";
import "forge-std/console.sol";

contract LiquidityPoolTest is Test
{
    address owner;
    address ZERO_ADDRESS = address(0);
    address user1 = address(1);
    address user2 = address(2);

    TestBridgedToken token1;
    TestBridgedToken token2;

    address bridge = address(5);

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    LiquidityPool liquidityPool;

    function setUp() public
    {
        owner = address(this);
        liquidityPool = new LiquidityPool(address(this));
        token1 = new TestBridgedToken("Test1", "TST1", address(this));
        token2 = new TestBridgedToken("Test2", "TST2", address(this));

        liquidityPool.setBridge(bridge);
        assertEq(liquidityPool.hasRole(BRIDGE_ROLE, bridge), true);
        assertEq(liquidityPool.hasRole(DEFAULT_ADMIN_ROLE, address(this)), true);

        token1.mint(owner, 100 * 10**18);
        token1.mint(user1, 200 * 10**18);


        token2.mint(user1, 100 * 10**18);
        token2.mint(user2, 200 * 10**18);
        token2.mint(owner, 400 * 10**18);

    }

    function testRevertOnNonOwnerSetBridge() public
    {
        vm.expectRevert();
        vm.prank(user1);
        liquidityPool.setBridge(bridge);
    }

    function testGetLiquidityOfTokenBeforeAddLiquidity() public
    {
        assertEq(liquidityPool.getLiquidityOfToken(address(token1)), 0);
    }

    function testGetLiquidityOfUserBeforeAddLiquidity() public
    {
        assertEq(liquidityPool.getLiquidityOfUser(user1, address(token1)), 0);
    }

    function testAddLiquidity() public
    {
        vm.startPrank(user1);
        token1.approve(address(liquidityPool), 50 * 10 ** 18);
        liquidityPool.addLiquidity(address(token1), 50 * 10 ** 18);
        assertEq(liquidityPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        
        console.logUint(liquidityPool.getLiquidityOfToken(address(token1)));
        console.logUint(liquidityPool.getLiquidityOfUser(user1, address(token1)));
        

        assertEq(liquidityPool.getLiquidityOfUser(user1, address(token1)), 50 * 10 ** 18);
        assertEq(liquidityPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        
        vm.stopPrank();
    }

    function testRemoveLiquidity() public
    {
        testAddLiquidity();

        vm.startPrank(user1);
        
        liquidityPool.removeLiquidity(address(token1), 50 * 10 ** 18);
        
        console.logUint(liquidityPool.getLiquidityOfToken(address(token1)));
        console.logUint(liquidityPool.getLiquidityOfUser(user1, address(token1)));
        

        assertEq(liquidityPool.getLiquidityOfUser(user1, address(token1)), 0);
        assertEq(liquidityPool.getLiquidityOfToken(address(token1)), 0);
        
        
        vm.stopPrank();
    }

    function testGetWithdrawableBridgedTokenAmountBeforeBridging() public
    {
        vm.startPrank(user1);

        assertEq(liquidityPool.getWithdrawableBridgedTokenAmount(user1, address(token1)), 0);

        vm.stopPrank();
    }

    function testAddBridgedToken() public
    {
        testAddLiquidity();

        vm.startPrank(bridge);
        liquidityPool.addBridgedToken(user1, address(token1), 50 * 10 ** 18);
        assertEq(liquidityPool.getWithdrawableBridgedTokenAmount(user1, address(token1)), 50 * 10 ** 18);

        vm.stopPrank();
    }

    function testAddBridgedTokenNoLiquidity() public
    {
        
        vm.startPrank(bridge);
        liquidityPool.addBridgedToken(user1, address(token1), 50 * 10 ** 18);
        assertEq(liquidityPool.getWithdrawableBridgedTokenAmount(user1, address(token1)), 0);

        vm.stopPrank();
    }

    function testRevertOnNonBridgeAddBridgedToken() public
    {
        vm.startPrank(user1);
        vm.expectRevert();
        liquidityPool.addBridgedToken(user1, address(token1), 50 * 10 ** 18);
        vm.stopPrank();
    }
}