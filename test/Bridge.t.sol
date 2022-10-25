pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../contracts/Bridge.sol";
import "../contracts/LiquidityPool.sol";
import "../contracts/test/TestBridgedToken.sol";
import "../contracts/test/ChildTunnelPublic.sol";
import "../contracts/test/RootTunnelPublic.sol";

contract BridgeTest is Test
{
    address owner;
    address ZERO_ADDRESS = address(0);
    address user1 = address(1);
    address user2 = address(2);
    
    Bridge ethereumBridge;
    Bridge polygonBridge;
    
    RootTunnelPublic rootTunnel;
    ChildTunnelPublic childTunnel;

    LiquidityPool ethereumPool;
    LiquidityPool polygonPool;
    
    TestBridgedToken token1;
    TestBridgedToken token2;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    uint256 polygonForkId;
    uint256 ethereumForkId;
    
    function setUp() public
    {

        polygonForkId = vm.createFork("http://127.0.0.1:8546/");
        ethereumForkId = vm.createFork("http://127.0.0.1:8545/");
        owner = address(this);

        vm.prank(owner);

        /// @notice this token is created here and will exist on both forks
        token1 = new TestBridgedToken("Test1", "TST1", owner);
        vm.makePersistent(address(token1));
        token1.mint(owner, 100 * 10**18);
        token1.mint(user1, 200 * 10**18);
        token1.mint(user2, 300 * 10**18);

        vm.selectFork(ethereumForkId);
        
        rootTunnel = new RootTunnelPublic();
        ethereumPool = new LiquidityPool(owner);
        ethereumBridge = new Bridge();
        ethereumBridge.initialize(address(rootTunnel), address(ethereumPool));
        ethereumPool.setBridge(address(ethereumBridge));
        rootTunnel.setParent(address(ethereumBridge));
        
        vm.selectFork(polygonForkId);

        childTunnel = new ChildTunnelPublic();
        polygonPool = new LiquidityPool(owner);
        polygonBridge = new Bridge();
        polygonBridge.initialize(address(childTunnel), address(polygonPool));
        polygonPool.setBridge(address(polygonBridge));
        childTunnel.setParent(address(polygonBridge));

    }

    function testAddLiquidityPolygon() public
    {
        vm.startPrank(user1);
        token1.approve(address(polygonPool), 50 * 10 ** 18);
        polygonPool.addLiquidity(address(token1), 50 * 10 ** 18);
        assertEq(polygonPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        
        console.logUint(polygonPool.getLiquidityOfToken(address(token1)));
        console.logUint(polygonPool.getLiquidityOfUser(user1, address(token1)));
        

        assertEq(polygonPool.getLiquidityOfUser(user1, address(token1)), 50 * 10 ** 18);
        assertEq(polygonPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        
        vm.stopPrank();
    }

    function testBridgeTokenEthereumToPolygon() public
    {

        vm.selectFork(ethereumForkId);
        
        vm.startPrank(user2);
        
        token1.approve(address(ethereumBridge), 50 * 10 ** 18);
        assertEq(token1.allowance(user2, address(ethereumBridge)), 50 * 10 ** 18);

        ethereumBridge.bridgeToken(address(token1), 50 * 10 ** 18);
        
        assertEq(token1.balanceOf(user2), 250 * 10 ** 18); /// from 300
        assertEq(token1.balanceOf(address(ethereumBridge)), 0);
        assertEq(ethereumPool.getLiquidityOfUser(address(ethereumBridge), address(token1)), 50 * 10 ** 18);
        assertEq(ethereumPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        
        vm.stopPrank();

        vm.selectFork(polygonForkId);

        assertEq(token1.balanceOf(user2), 250 * 10 ** 18);

        testAddLiquidityPolygon();

        assertEq(polygonPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18);
        assertEq(token1.balanceOf(user1), 150 * 10 ** 18);

        vm.startPrank(address(childTunnel));
        polygonBridge.unlockBridgedToken(address(token1), user2, 50 * 10 ** 18);
        vm.stopPrank();


        assertEq(polygonPool.getLiquidityOfToken(address(token1)), 0);
        assertEq(token1.balanceOf(user2), 300 * 10 ** 18);


        // assertEq(polygonPool.getWithdrawableBridgedTokenAmount(user2, address(token1)), 50 * 10 ** 18);

        // vm.prank(user2);
        // polygonBridge.withdrawBridgedToken(address(token1));
        // vm.stopPrank();
    }
}
