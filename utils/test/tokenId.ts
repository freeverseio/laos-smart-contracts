import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenId } from "../typechain-types/contracts/TokenId.js";

describe("ERC721UniversalSoulbound", function () {
  const maxSlot = 2n ** 96n - 1n;
  const nullAddress = ethers.toBeHex(0, 20);

  let contract: TokenId;

  const RECEIVER_MAGIC_VALUE = "0x150b7a02";

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    const TokenId = await ethers.getContractFactory(
      "TokenId",
    );
    contract = await TokenId.deploy();
    await contract.waitForDeployment();
  });

  it("Should report correct version of the uERC721 interface", async function () {
    expect(await contract.computeTokenId(nullAddress, 0)).to.equal(0);
  });
});