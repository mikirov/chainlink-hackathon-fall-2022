import { ethers, upgrades } from 'hardhat';
import { Signer } from 'ethers';
import { assert, expect } from 'chai';
import { Bridge, LiquidityPool, ChildTunnelPulbic, RootTunnelPublic } from '../typechain-types';


describe('Lottery', async function () {
    let BridgeProxy: Bridge;
    let LiquidityPool: LiquidityPool;
    let ChildTunnel: ChildTunnelPulbic;
    let RootTunnel: RootTunnelPublic;

    let ownerAccount: Signer;
    let secondAccount: Signer;

    before(async function () {
        [ownerAccount, secondAccount] = await ethers.getSigners();

        const ethereumProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const maticProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8546");

        const LiquidityPoolFactory = await ethers.getContractFactory('LiquidityPool', ethereumProvider.getSigner(0));
        LiquidityPool = await LiquidityPoolFactory.deploy(await ownerAccount.getAddress());

        const TunnelFactory = await ethers.getContractFactory("ChildTunnelPublic", ethereumProvider.getSigner(0));
        ChildTunnel = await TunnelFactory.deploy();

        const BridgeFactory = await ethers.getContractFactory("Bridge", ethereumProvider.getSigner(0));
        BridgeProxy = await upgrades.deployProxy(BridgeFactory, []) as Bridge;
        await BridgeProxy.deployed();
        console.log("Bridge Proxy deployed to:", BridgeProxy.address);

    });
});