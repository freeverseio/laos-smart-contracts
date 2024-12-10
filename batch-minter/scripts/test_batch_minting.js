const { ethers } = require("hardhat");
require("dotenv").config();

if (!process.env.SECOND_PRIVATE_KEY) {
  throw new Error("Please set the SECOND_PRIVATE_KEY in your .env file.");
}

const typicalURILength = "ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz".length; // = 47

async function assertReverts(asyncFunc, retries = 10, delay = 10000) {
  let attempts = 0;

  while (attempts < retries) {
    try {
      console.log(`Attempt ${attempts + 1}...`);
      await asyncFunc(); // Call the async function
      console.log('Transaction did not revert, retrying...');
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
    } catch (error) {
      if (error.message.includes('revert')) {
        console.log('Transaction reverted as expected.');
        return;
      } else {
        console.log(`Error encountered: ${error.message}`);
        console.log('Retrying due to a non-revert error...');
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      }
    }
  }

  throw new Error('Transaction did not revert after maximum retries');
}

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

function random32bitArray(n) {
  const result = new Set();
  while (result.size < n) {
    result.add(random32bit());
  }
  return Array.from(result);
}

async function mint(contract, sender, recipient) {
  const repeatedString = 'a'.repeat(typicalURILength);
  const tx = await contract.mintWithExternalURI(recipient, random32bit(), repeatedString, {from: sender});
  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args[2].toString();
  console.log('new tokenId = ', tokenId);
  return tokenId;
}

async function batchMint(contract, sender, recipient, uriLen = typicalURILength, num = 100) {
  console.log('...Batch Minting', num, "assets", "with tokenURI of length", uriLen);
  const recipients = Array(num).fill(recipient);
  const randoms = random32bitArray(num);
  const repeatedString = 'a'.repeat(uriLen);
  const uris = Array(num).fill(repeatedString);

  const tx = await contract.mintWithExternalURIBatch(recipients, randoms, uris, {from: sender});
  const receipt = await tx.wait();

  console.log(`Gas used for minting: ${receipt.gasUsed.toString()}`);
  console.log(`Gas used per mint: ${Number(receipt.gasUsed)/num}`);

  const tokenId0 = receipt.logs[0].args[2].toString();
  const tokenIdLast = receipt.logs[receipt.logs.length - 1].args[2].toString();
  console.log("First produced tokenId = ", tokenId0);
  console.log("Last produced tokenId = ", tokenIdLast);
}

async function batchEvolve(contract, sender, tokenId, uriLen = typicalURILength, num = 100) {
  console.log('...Batch Evolving', num, "times, the asset with tokenId = ", tokenId, "with tokenURI of length", uriLen);
  const tokenIds = Array(num).fill(tokenId);
  const repeatedString = 'a'.repeat(uriLen);
  const uris = Array(num).fill(repeatedString);

  const tx = await contract.evolveWithExternalURIBatch(tokenIds, uris, {from: sender});
  const receipt = await tx.wait();

  const nEvents = receipt.logs.length;
  console.log('...num events produced = ', nEvents);

  console.log(`Gas used for evolving: ${receipt.gasUsed.toString()}`);
  console.log(`Gas used per evolution: ${Number(receipt.gasUsed)/num}`);

  const tokenId0 = receipt.logs[0].args[0].toString();
  const tokenIdLast = receipt.logs[receipt.logs.length - 1].args[0].toString();
  console.log("First evolved tokenId = ", tokenId0);
  console.log("Last evolved tokenId = ", tokenIdLast);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account ${deployer.address}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);


  const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
  const batchMinter = await LaosBatchMinter.deploy(deployer.address);
  await batchMinter.waitForDeployment();
  console.log("...batchMinter deployed at", await batchMinter.getAddress());

  const precompileAddress = await batchMinter.precompileAddress();
  console.log("...batchMinter uses a collection managed by the following precompile address:", precompileAddress);
  const EvolutionCollectionInterface = await ethers.getContractAt("EvolutionCollection", precompileAddress);
  const precompileContract = EvolutionCollectionInterface.attach(precompileAddress);

  const bob = new ethers.Wallet(process.env.SECOND_PRIVATE_KEY, ethers.provider);
  console.log(`Bob will be the recipient account (${bob.address}), with balance (in Wei) ${await ethers.provider.getBalance(bob.address)}`);

  console.log('Deployer can batch mint using the batchMinter...');
  await batchMint(batchMinter, deployer, bob);

  console.log('Deployer can mint 1 single asset using the batchMinter...');
  const tokenId1 = await mint(batchMinter, deployer, bob);

  console.log('Deployer can batch-evolve using the batchMinter...');
  await batchEvolve(batchMinter, deployer, tokenId1);

  // console.log('Bob cannot mint using the batchMinter...');
  // await assertReverts(() => mint(batchMinter, bob, alice));

  // console.log('Bob cannot mint using the precompile neither...');
  // await assertReverts(() => mint(precompileContract, bob, alice));

  // console.log('Alice cannot mint using the precompile neither...');
  // await assertReverts(() => mint(precompileContract, alice, bob));

  // console.log('alice owns batchMinter?...',  alice == await batchMinter.batchMinterOwner());

  // console.log('bob cannot transfer batchMinter ownership...');
  // await assertReverts(() => batchMinter.transferBatchMinterOwnership(bob, {from: bob}));

  // console.log('Alice transfers batchMinter ownership to bob...');
  // await batchMinter.transferBatchMinterOwnership(bob);

  // console.log('PrecompileContract owner remains unchanged as expected?... ', batchMinter.address === await precompileContract.owner());
  // console.log('batchMinter owner has changed as expected?... ', bob === await batchMinter.batchMinterOwner());

  // console.log('Alice cannot change the owner of the precompile using the precompile...');
  // await assertReverts(() => precompileContract.transferOwnership(alice, {from: alice, gas: maxGas}));

  // console.log('Alice cannot change the owner of the precompile using the batchMinter...');
  // await assertReverts(() => batchMinter.transferOwnership(alice, {from: alice, gas: maxGas}));

  // console.log('bob changes the ownership of the precompile using the batchMinter...');
  // await batchMinter.transferOwnership(alice, {from: bob, gas: maxGas});
  // console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
  