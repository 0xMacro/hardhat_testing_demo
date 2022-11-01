import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { KingOfTheHill, KingOfTheHill__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";

describe("KingOfTheHill", () => {
  let KingOfTheHill: KingOfTheHill__factory;
  let kingOfTheHill: KingOfTheHill;

  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;

  const setupFixture = async () => {
    const KingOfTheHill = (await ethers.getContractFactory(
      "KingOfTheHill"
    )) as KingOfTheHill__factory;
    const kingOfTheHill = await KingOfTheHill.deploy({
      value: parseEther("1"),
    });

    const [deployer, alice] = await ethers.getSigners();

    return { kingOfTheHill, deployer, alice };
  };

  beforeEach(async () => {
    ({ kingOfTheHill, deployer, alice } = await loadFixture(setupFixture));
  });

  describe("Deployment", async () => {
    it("initial king is deployer, height is msg.value", async () => {
      const hill = await kingOfTheHill.hill();

      const king = hill[0];
      const height = hill[1];

      expect(king).to.equal(deployer.address);
      expect(height).to.equal(parseEther("1"));
    });
  });

  describe("Overthrowing", async () => {
    it("current king can't overthrow themself", async () => {
      await expect(
        kingOfTheHill.overthrow({ value: parseEther("5") })
      ).to.be.revertedWith("Cannot overthrow self");
    });

    it("reverts if amount is less than current height", async () => {
      await expect(
        kingOfTheHill.connect(alice).overthrow({ value: parseEther("0.5") })
      ).to.be.revertedWithCustomError(kingOfTheHill, "InsufficientAmount");
    });

    it("reverts if amount is equal to current height", async () => {
      await expect(
        kingOfTheHill.connect(alice).overthrow({ value: parseEther("1") })
      ).to.be.revertedWithCustomError(kingOfTheHill, "InsufficientAmount");
    });

    it("updates king and height on successful overthrow", async () => {
      await kingOfTheHill.connect(alice).overthrow({ value: parseEther("2") });

      const hill = await kingOfTheHill.hill();

      expect(hill).to.deep.equal([alice.address, parseEther("2")]);
    });

    it("sends funds to old king", async () => {
      const { provider } = ethers;

      const balanceBefore = await provider.getBalance(deployer.address);
      await kingOfTheHill.connect(alice).overthrow({ value: parseEther("2") });
      const balanceAfter = await provider.getBalance(deployer.address);

      expect(balanceAfter.sub(balanceBefore)).to.closeTo(
        parseEther("2"),
        parseEther(".001")
      );
    });

    it("emits an event", async () => {
      const tx = await kingOfTheHill
        .connect(alice)
        .overthrow({ value: parseEther("2") });

      const receipt = await tx.wait();
      const event = receipt.events![0];
      expect(event.event).to.equal("NewKing");
      expect(event.args![0]).to.equal(alice.address);
      expect(event.args![1]).to.equal(parseEther("2"));
    });
  });

  describe("Increasing Height", async () => {
    it("rejects ETH from anyone besides current king", async () => {
      const tx = { to: kingOfTheHill.address, value: parseEther("5") };
      await expect(alice.sendTransaction(tx)).to.be.revertedWith(
        "Only king can increase height"
      );
    });

    it("increases height on a contribution from current king", async () => {
      const tx = { to: kingOfTheHill.address, value: parseEther("5") };

      await deployer.sendTransaction(tx);

      const hill = await kingOfTheHill.hill();
      expect(hill).to.deep.equal([deployer.address, parseEther("6")]);
    });

    it("emits an event", async () => {
      const tx = { to: kingOfTheHill.address, value: parseEther("5") };

      await expect(deployer.sendTransaction(tx))
        .to.emit(kingOfTheHill, "IncreasedHeight")
        .withArgs(parseEther("6"));
    });
  });
});
