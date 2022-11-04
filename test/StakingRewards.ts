import { ethers } from "hardhat";
import { assert } from "chai";
import { StakingRewardsPublic } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("StakingRewards", async function () {
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let StakingRewards: StakingRewardsPublic;

  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  this.beforeEach(async () => {
    [deployer, alice, bob, carol] = await ethers.getSigners();

    const factory = await ethers.getContractFactory(
      "StakingRewardsPublic",
      deployer
    );

    StakingRewards = await factory.deploy();

    await StakingRewards.deployed();
  });

  const stake = async (
    signer: SignerWithAddress,
    token: string,
    amount: number
  ) => {
    await StakingRewards.connect(signer).stake(
      token,
      ethers.utils.parseEther(amount.toString())
    );
  };

  const unstake = async (
    signer: SignerWithAddress,
    token: string,
    amount: number
  ) => {
    await StakingRewards.connect(signer).unstake(
      token,
      ethers.utils.parseEther(amount.toString())
    );
  };

  const addReward = async (token: string, amount: number) => {
    await StakingRewards.addReward(
      token,
      ethers.utils.parseEther(amount.toString())
    );
  };

  const getRewardsOf = async (
    signer: SignerWithAddress,
    token: string
  ): Promise<number> => {
    return Number(
      ethers.utils.formatEther(
        await StakingRewards.earnedRewardsOf(token, signer.address)
      )
    );
  };

  const calculateRewardsOf = async (
    signer: SignerWithAddress,
    token: string
  ) => {
    const [, rewards] = await StakingRewards.calculateRewardsOf(
      token,
      signer.address
    );
    return Number(ethers.utils.formatEther(rewards));
  };

  const assertDecimals = (actual: number, expected: number) => {
    assert.equal(actual.toFixed(2), expected.toFixed(2));
  };

  describe("Math", () => {
    // - no staked
    // - no rewards
    it(`Alice should have earned 0 rewards`, async () => {
      const noRewards = await getRewardsOf(alice, WETH);

      assertDecimals(noRewards, 0);
    });
    // - no staked
    // - no rewards
    it(`should calculate 0 rewards for Alice`, async () => {
      const noRewards = await calculateRewardsOf(alice, WETH);

      assertDecimals(noRewards, 0);
    });
    // Alice stake - 100
    // - no rewards
    it(`should calculate 0 rewards for Alice`, async () => {
      await stake(alice, WETH, 100);
      const noRewards = await calculateRewardsOf(alice, WETH);

      assertDecimals(noRewards, 0);
    });
    // new reward - 1
    // Alice stake - 100
    it(`Alice should earn 1 rewards`, async () => {
      await addReward(WETH, 1);
      await stake(alice, WETH, 100);

      const calculatedRewards = await calculateRewardsOf(alice, WETH);

      await unstake(alice, WETH, 100);
      const earnedRewards = await getRewardsOf(alice, WETH);

      assertDecimals(calculatedRewards, 1);
      assertDecimals(earnedRewards, 1);
    });
    // Alice stake - 100
    //  new reward - 1
    it(`Alice should earn 1 rewards`, async () => {
      await stake(alice, WETH, 100);
      await addReward(WETH, 1);
      await unstake(alice, WETH, 100);

      const earned = await getRewardsOf(alice, WETH);

      assertDecimals(earned, 1);
    });

    // Alice stake - 100
    //  new reward - 1
    // Bob stake - 1000
    it(`Alice should earn 1 rewards,
        Bob should earn 0 rewards`, async () => {
      await stake(alice, WETH, 100);
      await addReward(WETH, 1);
      await stake(bob, WETH, 1000);
      await unstake(alice, WETH, 100);

      const aliceReward = await getRewardsOf(alice, WETH);
      const bobReward = await getRewardsOf(bob, WETH);

      assertDecimals(aliceReward, 1);
      assertDecimals(bobReward, 0);
    });

    // Alice stake - 100
    //  new reward - 1
    // Bob stake   - 100
    //  new reward - 0.2
    it(`Alice should earn 1.1 rewards,
        Bob should earn 0.1 rewards
    `, async () => {
      await stake(alice, WETH, 100);
      await addReward(WETH, 1);
      await stake(bob, WETH, 100);
      await addReward(WETH, 0.2);
      await unstake(bob, WETH, 100);
      await unstake(alice, WETH, 100);

      const aliceRewards = await getRewardsOf(alice, WETH);
      const bobRewards = await getRewardsOf(bob, WETH);

      assertDecimals(aliceRewards, 1.1);
      assertDecimals(bobRewards, 0.1);
    });

    // Alice stake - 100
    //  new reward - 1
    // Bob stake   - 100
    //  new reward - 0.2
    // Bob unstake - 50
    //  new reward - 0.5
    it(`Alice should earn 1.43 rewards,
        Bob should earn 0.2665 rewards
    `, async () => {
      await stake(alice, WETH, 100);
      await addReward(WETH, 1);
      await stake(bob, WETH, 100);
      await addReward(WETH, 0.2);
      await unstake(bob, WETH, 50);
      await addReward(WETH, 0.5);
      await unstake(bob, WETH, 50);
      await unstake(alice, WETH, 100);

      const aliceRewards = await getRewardsOf(alice, WETH);
      const bobRewards = await getRewardsOf(bob, WETH);

      assertDecimals(aliceRewards, 1.433);
      assertDecimals(bobRewards, 0.2665);
    });

    // Alice stake - 100
    //  new reward - 1
    //  new reward - 0.3
    // Bob stake   - 50
    //  new reward - 0.3
    // Bob unstake - 50
    // Carol stake - 50
    //  new reward - 0.5
    // Alice unstake - 50
    // Carol stake - 50
    //  new reward - 0.8
    it(`Alice should earn 2.0999 rewards,
        Bob should earn 0.1 rewards,
        Carol should earn 0.6993 rewards
    `, async () => {
      await stake(alice, WETH, 100);
      await addReward(WETH, 1);
      await addReward(WETH, 0.3);
      await stake(bob, WETH, 50);
      await addReward(WETH, 0.3);
      await unstake(bob, WETH, 50);
      await stake(carol, WETH, 50);
      await addReward(WETH, 0.5);
      await unstake(alice, WETH, 50);
      await stake(carol, WETH, 50);
      await addReward(WETH, 0.8);
      await unstake(carol, WETH, 100);
      await unstake(alice, WETH, 50);

      const aliceRewards = await getRewardsOf(alice, WETH);
      const bobRewards = await getRewardsOf(bob, WETH);
      const carolRewards = await getRewardsOf(carol, WETH);

      assertDecimals(aliceRewards, 2.0999);
      assertDecimals(bobRewards, 0.1);
      assertDecimals(carolRewards, 0.6993);
    });
  });
});
