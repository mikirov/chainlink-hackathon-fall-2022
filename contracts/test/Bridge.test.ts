import { ethers, upgrades } from 'hardhat';
import { Signer } from 'ethers';
import { assert, expect } from 'chai';
import { Bridge, LiquidityPool, ChildTunnelPulbic, RootTunnelPublic } from '../typechain-types';


describe('Lottery', async function () {
    let ethereumBridge: Bridge;
    let polygonBridge: Bridge;

    let ethereumPool: LiquidityPool;
    let polygonPool: LiquidityPool;

    let childTunnel: ChildTunnelPulbic;
    let rootTunnel: RootTunnelPublic;

    let ownerAccount: Signer;
    let secondAccount: Signer;

    before(async function () {
        [ownerAccount, secondAccount] = await ethers.getSigners();

        const ethereumProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const polygonProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8546");

        const rootTunnelFactory = await ethers.getContractFactory("RootTunnelPublic", ethereumProvider.getSigner(0));
        rootTunnel = await rootTunnelFactory.deploy();
        await rootTunnel.deployed();

        const ethereumPoolFactory = await ethers.getContractFactory('LiquidityPool', ethereumProvider.getSigner(0));
        ethereumPool = await ethereumPoolFactory.deploy(await ownerAccount.getAddress());
        await ethereumPool.deployed();

        const ethereumBridgeFactory = await ethers.getContractFactory("Bridge", ethereumProvider.getSigner(0));
        ethereumBridge = await upgrades.deployProxy(ethereumBridgeFactory, [rootTunnel.address, ethereumPool.address]) as Bridge;
        await ethereumBridge.deployed();

        await ethereumPool.setBridge(ethereumBridge.address);
        await rootTunnel.setBridge(ethereumBridge.address);

        const childTunenlFactory = await ethers.getContractFactory("ChildTunnelPublic", polygonProvider.getSigner(0));
        childTunnel = await childTunenlFactory.deploy();
        await childTunnel.deployed();

        const polygonPoolFactory = await ethers.getContractFactory('LiquidityPool', polygonProvider.getSigner(0));
        polygonPool = await polygonPoolFactory.deploy(await ownerAccount.getAddress());
        await polygonPool.deployed();

        const polygonBridgeFactory = await ethers.getContractFactory("Bridge", polygonProvider.getSigner(0));
        polygonBridge = await upgrades.deployProxy(polygonBridgeFactory, []) as Bridge;
        await polygonBridge.deployed();

        await polygonPool.setBridge(polygonBridge.address);
        await childTunnel.setBridge(polygonBridge.address);
    });
});