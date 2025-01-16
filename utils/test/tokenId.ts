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

  it("Should report correct version of the uERC721 interface", async function () {
    expect(
      await contract.computeTokenId(nullAddress, 0))
      .to.equal(0);

      expect(
        await contract.computeTokenId('0x90abcdef1234567890abcdef1234567890abcdef', '0x1234567890abcdef'))
        .to.equal('1917151762750544880654683969214147817878133287987683378847961304559');

      expect(
        await contract.computeTokenId('0x90abcdef1234567890abcdef1234567890abcdef', '0x1234567890abcdef'))
        .to.equal('1917151762750544880654683969214147817878133287987683378847961304559');
  
      expect(
        await contract.computeTokenId('0xffffffffffffffffffffffffffffffffffffffff', '0'))
        .to.equal('1461501637330902918203684832716283019655932542975');
  
      expect(
        await contract.computeTokenId('0x0000000000000000000000000000000000000001', '1'))
        .to.equal('1461501637330902918203684832716283019655932542977');
  
      expect(
        await contract.computeTokenId('0x1234567890abcdef1234567890abcdef12345678', '0xffffffffffffffffffff'))
        .to.equal('1766847064778384329583296143170286492852322417545392043886226158472418936');
      
              

  //   initOwner: "0x90abcdef1234567890abcdef1234567890abcdef",
  //   slot: '0x1234567890abcdef',
  //   expected: "1917151762750544880654683969214147817878133287987683378847961304559",
  //   expectedToHex: "0x000000001234567890abcdef90abcdef1234567890abcdef1234567890abcdef",
  // },
  // {
  //   initOwner: "0xffffffffffffffffffffffffffffffffffffffff",
  //   slot: 0,
  //   expected: "1461501637330902918203684832716283019655932542975",
  //   expectedToHex: "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
  // },
  // {
  //   initOwner: "0x0000000000000000000000000000000000000000",
  //   slot: 0,
  //   expected: "0",
  //   expectedToHex: "0x0000000000000000000000000000000000000000000000000000000000000000",
  // },    {
  //   initOwner: "0x0000000000000000000000000000000000000001",
  //   slot: 1,
  //   expected: "1461501637330902918203684832716283019655932542977",
  //   expectedToHex: "0x0000000000000000000000010000000000000000000000000000000000000001",
  // },
  // {
  //   initOwner: "0x1234567890abcdef1234567890abcdef12345678",
  //   slot: '0xffffffffffffffffffff',
  //   expected: "1766847064778384329583296143170286492852322417545392043886226158472418936",
  //   expectedToHex:"0x0000ffffffffffffffffffff1234567890abcdef1234567890abcdef12345678",
  // },


  });
});