// This script performs an end-to-end test for the PublicMinterMinimal contract.
// It verifies the deployment, ownership transfer, and interactions with the precompile contract.
// Additionally, it ensures that unauthorized actions are correctly reverted.

const { ethers } = require("hardhat");
const { expect } = require("chai");

const typicalURILength = "ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz".length; // = 47
const dummyString = 'a'.repeat(typicalURILength);

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

async function main() {

  // The deployer account is specifed in hardhat.config.js, which reads the .env file. It needs to have funds.
  // The owner of the publicMinter is set on deploy, and it can be any address, not necessarily the same as the deployer, not necessarily with funds.
  // This owner will be able to mint, evolve, etc., for which funds will be needed.

  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner

  console.log(`Deploying with account ${deployer.address}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);

  const LaosPublicMinter = await ethers.getContractFactory("LaosPublicMinterMinimal");
  const publicMinter = await LaosPublicMinter.deploy(owner);
  await publicMinter.waitForDeployment();
  console.log("...publicMinter deployed at", await publicMinter.getAddress());

  console.log("...publicMinter has expected owner?", owner === await publicMinter.publicMinterOwner());

  const precompileAddress = await publicMinter.precompileAddress();
  console.log("...publicMinter uses a collection managed by the following precompile address:", precompileAddress);

  const EvolutionCollectionInterface = await ethers.getContractAt("EvolutionCollection", precompileAddress);
  const precompileContract = EvolutionCollectionInterface.attach(precompileAddress);

  const precompileOwner = await precompileContract.owner();
  console.log("...the owner of the collection at that precompile address is the newly deployed publicMinter?", await publicMinter.getAddress() === precompileOwner);

  const bob = new ethers.Wallet(process.env.SECOND_PRIVATE_KEY, ethers.provider);
  console.log(`Bob will be the recipient account (${bob.address}), with balance (in Wei) ${await ethers.provider.getBalance(bob.address)}`);

  console.log('Deployer can mint 1 single asset using the publicMinter...');
  const tx = await publicMinter.mintWithExternalURI(bob.address, random32bit(), dummyString);
  const receipt = await tx.wait();
  const tokenId1 = receipt.logs[0].args[2].toString();
  console.log('...new tokenId = ', tokenId1);

  console.log('Bob can also mint using the publicMinter...');
  const publicMinterWithBob = publicMinter.connect(bob);
  const tx2 = await publicMinter.mintWithExternalURI(bob.address, random32bit(), dummyString);
  const receipt2 = await tx2.wait();
  const tokenId2 = receipt2.logs[0].args[2].toString();
  console.log('...new tokenId = ', tokenId2);

  console.log('Bob cannot mint using the precompile neither...');
  const precompileWithBob = precompileContract.connect(bob);
  await expect(
    precompileWithBob.mintWithExternalURI(bob.address, random32bit(), "teeeeest")
  ).to.be.reverted;

  console.log('Bob cannot transfer publicMinter ownership...');
  await expect(
    publicMinterWithBob.transferPublicMinterOwnership(bob.address)
  ).to.be.revertedWithCustomError(publicMinterWithBob, "OwnableUnauthorizedAccount")
  .withArgs(bob.address);

  console.log('Transferring ownership of publicMinter to Bob by deployer...');
  const tx1 = await publicMinter.transferPublicMinterOwnership(bob.address);
  await tx1.wait();
  
  console.log('PrecompileContract owner remains unchanged as expected?... ', await publicMinter.getAddress() === await precompileContract.owner());
  console.log('publicMinter owner has changed as expected?... ', bob.address === await publicMinter.publicMinterOwner());

  console.log('Deployer cannot transfer publicMinter ownership anymore...');
  await expect(
    publicMinter.transferPublicMinterOwnership(deployer.address)
  ).to.be.revertedWithCustomError(publicMinterWithBob, "OwnableUnauthorizedAccount")
  .withArgs(deployer.address); 

  console.log('Deployer cannot change the owner of the precompile using the publicMinter...');
  await expect(
    publicMinter.transferOwnership(deployer.address)
  ).to.be.revertedWithCustomError(publicMinterWithBob, "OwnableUnauthorizedAccount")
  .withArgs(deployer.address); 

  console.log('Bob can change the ownership of the precompile using the publicMinter...');
  const tx3 = await publicMinterWithBob.transferOwnership(deployer.address);
  await tx3.wait();
  console.log('precompileContract owner is deployer?... ', deployer.address === await precompileContract.owner());
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error.message);
  process.exit(1);
});
