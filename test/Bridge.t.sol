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

    TokenMapping ethereumTokenMapping;
    TokenMapping polygonTokenMapping;

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

        vm.startPrank(owner);

        /// @notice this token is created here and will exist on both forks
        token1 = new TestBridgedToken("Test1", "TST1", owner);
        /// @notice persistent so the addresses of both tokens can be accessed on both forks
        vm.makePersistent(address(token1));
        token1.mint(user2, 50 * 10**18);

        token2 = new TestBridgedToken("Test2", "TST2", owner);
        vm.makePersistent(address(token2));
        token2.mint(user1, 50 * 10**18);

        vm.selectFork(ethereumForkId);
        
        rootTunnel = new RootTunnelPublic();
        ethereumPool = new LiquidityPool(owner);
        ethereumTokenMapping = new TokenMapping();
        ethereumBridge = new Bridge();
        ethereumBridge.initialize(address(rootTunnel), address(ethereumPool), address(ethereumTokenMapping));
        ethereumPool.setBridge(address(ethereumBridge));
        rootTunnel.setParent(address(ethereumBridge));
        
        ethereumTokenMapping.addToMapping(address(token1), address(token2));

        vm.selectFork(polygonForkId);

        childTunnel = new ChildTunnelPublic();
        polygonPool = new LiquidityPool(owner);
        polygonTokenMapping = new TokenMapping();
        polygonBridge = new Bridge();
        polygonBridge.initialize(address(childTunnel), address(polygonPool), address(polygonTokenMapping));
        polygonPool.setBridge(address(polygonBridge));
        childTunnel.setParent(address(polygonBridge));

        polygonTokenMapping.addToMapping(address(token2), address(token1));

        vm.stopPrank();

    }

    function testAddLiquidityPolygon() public
    {
        vm.startPrank(user1);
        token2.approve(address(polygonPool), 50 * 10 ** 18);
        polygonPool.addLiquidity(address(token2), 50 * 10 ** 18);
        
        // console.logUint(polygonPool.getLiquidityOfToken(address(token2)));
        // console.logUint(polygonPool.getLiquidityOfUser(user1, address(token2)));
        
        assertEq(polygonPool.getLiquidityOfUser(user1, address(token2)), 50 * 10 ** 18);
        assertEq(polygonPool.getLiquidityOfToken(address(token2)), 50 * 10 ** 18);
        assertEq(token2.balanceOf(user1), 0);

        vm.stopPrank();
    }

    function testBridgeTokenOnEthereum() public
    {
        vm.selectFork(ethereumForkId);
        
        vm.startPrank(user2);
        
        token1.approve(address(ethereumBridge), 50 * 10 ** 18);
        assertEq(token1.allowance(user2, address(ethereumBridge)), 50 * 10 ** 18);

        ethereumBridge.bridgeToken(address(token1), 50 * 10 ** 18);
        
        assertEq(token1.balanceOf(user2), 0 );
        assertEq(token1.balanceOf(address(ethereumBridge)), 0); /// the bridge itself shouldn't hold the tokens

        assertEq(ethereumPool.getLiquidityOfUser(address(ethereumBridge), address(token1)), 50 * 10 ** 18); // the bridge should hold liquidity in the pool
        assertEq(ethereumPool.getLiquidityOfToken(address(token1)), 50 * 10 ** 18); // pool token liquidity should increase
        
        vm.stopPrank();
    }

    function testBridgeTokenEthereumToPolygon() public
    {

        testBridgeTokenOnEthereum();

        vm.selectFork(polygonForkId);

        testAddLiquidityPolygon();

        vm.startPrank(address(childTunnel));
        polygonBridge.unlockBridgedToken(address(token2), user2, 50 * 10 ** 18);
        vm.stopPrank();

        assertEq(polygonPool.getLiquidityOfToken(address(token2)), 0);
        assertEq(token2.balanceOf(user2), 50 * 10 ** 18);
    }
}
