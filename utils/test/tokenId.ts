import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC721UniversalSoulbound", function () {
  const maxSlot = 2n ** 96n - 1n;
  const nullAddress = ethers.toBeHex(0, 20);

  let contract: any;

  beforeEach(async function () {
    const TokenId = await ethers.getContractFactory(
      "TokenId",
    );
    contract = await TokenId.deploy();
    await contract.waitForDeployment();
  });

  it("Should decode to null when all is null", async function () {
    expect(
      await contract.computeTokenId(nullAddress, 0))
      .to.equal(0);
  });

  it("Should decode as expected", async function () {
    const initOwner = '0x90abcdef1234567890abcdef1234567890abcdef';
    const slot = '0x1234567890abcdef';
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('1917151762750544880654683969214147817878133287987683378847961304559');
    expect(ethers.toBeHex(id)).to.equal('0x1234567890abcdef90abcdef1234567890abcdef1234567890abcdef');
  });

  it("Should decode as expected when slot is null", async function () {
    const initOwner = '0xffffffffffffffffffffffffffffffffffffffff';
    const slot = '0';
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('1461501637330902918203684832716283019655932542975');
    expect(ethers.toBeHex(id)).to.equal('0xffffffffffffffffffffffffffffffffffffffff');
  });

  it("Should decode as expected when both params are unit", async function () {
    const initOwner = '0x0000000000000000000000000000000000000001';
    const slot = 1;
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('1461501637330902918203684832716283019655932542977');
    expect(ethers.toBeHex(id)).to.equal('0x010000000000000000000000000000000000000001');
  });

  it("Should decode as expected", async function () {
    const initOwner = '0x1234567890abcdef1234567890abcdef12345678';
    const slot = '0xffffffffffffffffffff';
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('1766847064778384329583296143170286492852322417545392043886226158472418936');
    expect(ethers.toBeHex(id)).to.equal('0xffffffffffffffffffff1234567890abcdef1234567890abcdef12345678');
  });

});