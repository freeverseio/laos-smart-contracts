import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC721UniversalSoulbound", function () {

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
    const nullAddress = ethers.toBeHex(0, 20);
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

  it("Should decode as expected for max slot", async function () {
    const initOwner = '0x1234567890abcdef1234567890abcdef12345678';
    const slot = 2n ** 96n - 1n;
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('115792089237316195423570985007330335221247009504161233812543348627870309439096');
    expect(ethers.toBeHex(id)).to.equal('0xffffffffffffffffffffffff1234567890abcdef1234567890abcdef12345678');
  });

  it("Should decode as expected for max slot and initOwner", async function () {
    const initOwner = '0xffffffffffffffffffffffffffffffffffffffff';
    const slot = 2n ** 96n - 1n;
    const id = await contract.computeTokenId(initOwner, slot);
    expect(id).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935');
    expect(ethers.toBeHex(id)).to.equal('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  });

  it("Array version works as expected", async function () {
    const initOwners = [
      nullAddress,
      '0x90abcdef1234567890abcdef1234567890abcdef',
      '0xffffffffffffffffffffffffffffffffffffffff',
      '0x0000000000000000000000000000000000000001',
      '0x1234567890abcdef1234567890abcdef12345678',
      '0x1234567890abcdef1234567890abcdef12345678',
      '0xffffffffffffffffffffffffffffffffffffffff',
    ];
    const slots = [
      0,
      '0x1234567890abcdef',
      0,
      1,
      '0xffffffffffffffffffff',
      2n ** 96n - 1n,
      2n ** 96n - 1n,
    ];

    expect(await contract.computeTokenIds(initOwners, slots)).to.deep.equal([
      '0',
      '1917151762750544880654683969214147817878133287987683378847961304559',
      '1461501637330902918203684832716283019655932542975',
      '1461501637330902918203684832716283019655932542977',
      '1766847064778384329583296143170286492852322417545392043886226158472418936',
      '115792089237316195423570985007330335221247009504161233812543348627870309439096',
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ]);
  });
});