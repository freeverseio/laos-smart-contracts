const { ethers } = require("hardhat");

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

  const LaosPublicMinter = await ethers.getContractFactory("LaosPublicMinter");
  const publicMinter = await LaosPublicMinter.deploy(owner);
  await publicMinter.waitForDeployment();
  console.log("...publicMinter deployed at", await publicMinter.getAddress());

  // Deploy is finished. The remaining code in this script runs sanity checks, verifying that everything is correctly configured. 

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
