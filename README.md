# TheBridge

Decentralized cross-chain bridge between Ethereum and Polygon. 

**The problem** - The main problem with most bridges nowadays is that they are:

1 ) Centralized

2 ) Lack of liquidity

**Our solution**

1 ) Decentralization - We are using the Polygon tunnels to communicate between both chains. These tunnels are periodically observed by the Polygon validator nodes and synced automatically(every ~20-30 min) using "State Sync".

2 ) Liquidity - To incentivize users to provide liquidity, the bridge has a fee of 0.1% per each token bridge. We are using "Discrete Staking Mechanism" to  distribute rewards fairly to all liquidity providers pro-rata of their stake.

The bridge has 2 types of users:
- **Liquidity Providers** - The ones that are providing liquidity to the pool, so the bridge users can bridge tokens between both chains. We support multiple tokens, controlled by TokenMapping contract which ensures the token is supported from the bridge and associated with the coresponding token address of the destination chain. Liquidity providers can earn 0.1% fee per each token bridge based on their proportion of the total stake. More token bridges, more fees, more rewards for the providers.

- **Bridge Users** - The ones that are using the bridge to transfer tokens between both chains. They rely on the Liquidity Providers to supply tokens on both chains, so they can use them. Per each token bridge, they will receive 0.1% less than the bridged amount. The deducted fee is distributed to all the LPs.


Right now the bridge is working only Ethereum -> Polygon. There is a problem with the generated proof by maticjs library and it cannot be processed by the Ethereum tunnel. We are still trying to resolve it. 

# Setup and Install

`$ git clone https://github.com/mikirov/chainlink-hackathon-fall-2022`
`$ cd /ui`
`$ npm install`
`$ npm start`

# Deployments

```
*** Ethereum ***
Token deployed to: 0x011C1B8a25e4f309e78f717cF021939c4b5f2E6F
Tunnel deployed to:  0x5CbBC6C5A5cC4e9B9bc4b0bEc8eCE75B59290d37
Pool deployed to:  0xa0EA167a5163634Fb016743E4f34e0a7B728D50b
Token Mapping deployed to:  0xc98E165f0B20E3E296B723276966547A104d4e65
Bridge Proxy deployed to: 0xB370736D491294D183E4aFf5b7ccd30289bB3d54
*** Polygon ***
Tunnel deployed to:  0x456dE776A554c221b516874500c65078EB4C2c2f
Pool deployed to:  0x11f3D2df3082D52d20A3a1633C34a25338D1C56c
Token Mapping deployed to:  0xaD694E24cF980934dA88C5d4E05c0cCffaA7706d
Bridge Proxy deployed to: 0x595D8B115eAC4F56EAd6BBd2914d7556F238A0e9
Token deployed to: 0x565A39628964995F1D74502d03838b42E280b18b

```

# Functionalities

- Get free tokens to test out the bridge
![](/docs/facet.png)
- Add Liquidity
![](/docs/add-liquidity.png)
- Remove Liquidity
![](/docs/remove-liquidity.png)
- Bridge tokens(WIP)
![](/docs/bridge.png)