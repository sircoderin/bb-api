import { expect } from "chai";
import { ethers } from "hardhat";
import { BubbleBreakerBadge } from "../typechain-types";
import { eth } from "web3";

describe("BubbleBreakerBadge", function () {
  // We define a fixture to reuse the same setup in every test.

  let bubbleBreakerBadge: BubbleBreakerBadge;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("BubbleBreakerBadge");
    bubbleBreakerBadge = (await yourContractFactory.deploy()) as BubbleBreakerBadge;
    await bubbleBreakerBadge.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right id on deploy", async function () {
      expect(await bubbleBreakerBadge.getNextId()).to.equal(1);
    });

    it("Should have no mintable nfts", async function () {
      const [owner] = await ethers.getSigners();
      const address = await owner.getAddress();

      expect(await bubbleBreakerBadge.getPublicMintableNFTs(address)).to.have.lengthOf(0);
    });

    it("Should be able to update mintable nfts", async function () {
      const [owner] = await ethers.getSigners();
      const address = await owner.getAddress();

      await bubbleBreakerBadge.updateMintableNFTs(address, 50);
    });

    it("Should have two mintable nfts", async function () {
      const [owner] = await ethers.getSigners();
      const address = await owner.getAddress();

      expect(await bubbleBreakerBadge.getPublicMintableNFTs(address)).to.have.lengthOf(2);
    });
  });
});
