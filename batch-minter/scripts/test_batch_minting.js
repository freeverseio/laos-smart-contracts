const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosBatchMinter = artifacts.require("LaosBatchMinter");
const truffleAssert = require('truffle-assertions');

const createCollectionAddress = "0x0000000000000000000000000000000000000403";
const maxGas = 5000000;
const maxGasInBlock = 13000000; // if we set it to 14M it fails
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
  const response = await contract.mintWithExternalURI(recipient, random32bit(), repeatedString, {
    from: sender,
    gas: maxGas,
  });
  truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for minting: ${Number(txReceipt.gasUsed)}`);
  return tokenId;
}

async function batchMint(contract, sender, recipient, uriLen = typicalURILength, num = 700) {
  console.log('...Batch Minting', num, "assets", "with tokenURI of length", uriLen);
  const recipients = Array(num).fill(recipient);
  const randoms = random32bitArray(num);
  const repeatedString = 'a'.repeat(uriLen);
  const uris = Array(num).fill(repeatedString);

  const response = await contract.mintWithExternalURIBatch(recipients, randoms, uris, {
    from: sender,
    gas: maxGasInBlock,
  });
  const nEvents = response.logs.length;
  console.log('...num events produced = ', nEvents);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for minting: ${Number(txReceipt.gasUsed)}`);
  console.log(`Gas used per mint: ${Number(txReceipt.gasUsed)/num}`);
  const tokenId0 = response.logs[0].args["_tokenId"].toString();
  const tokenIdLast = response.logs[nEvents-1].args["_tokenId"].toString();
  console.log('first produced tokenId = ', tokenId0);
  console.log('first produced tokenId = ', tokenIdLast);
}

async function batchMint(contract, sender, recipient, uriLen = typicalURILength, num = 700) {
  console.log('...Batch Minting', num, "assets", "with tokenURI of length", uriLen);
  const recipients = Array(num).fill(recipient);
  const randoms = random32bitArray(num);
  const repeatedString = 'a'.repeat(uriLen);
  const uris = Array(num).fill(repeatedString);

  const response = await contract.mintWithExternalURIBatch(recipients, randoms, uris, {
    from: sender,
    gas: maxGasInBlock,
  });
  const nEvents = response.logs.length;
  console.log('...num events produced = ', nEvents);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for minting: ${Number(txReceipt.gasUsed)}`);
  console.log(`Gas used per mint: ${Number(txReceipt.gasUsed)/num}`);
  const tokenId0 = response.logs[0].args["_tokenId"].toString();
  const tokenIdLast = response.logs[nEvents-1].args["_tokenId"].toString();
  console.log('first produced tokenId = ', tokenId0);
  console.log('first produced tokenId = ', tokenIdLast);
}
async function batchEvolve(contract, sender, tokenId, uriLen = typicalURILength, num = 700) {
  console.log('...Batch Evolving', num, "times, the asset with tokenId = ", tokenId, "with tokenURI of length", uriLen);
  const tokenIds = Array(num).fill(tokenId);
  const repeatedString = 'a'.repeat(uriLen);
  const uris = Array(num).fill(repeatedString);

  const response = await contract.evolveWithExternalURIBatch(tokenIds, uris, {
    from: sender,
    gas: maxGasInBlock,
  });
  const nEvents = response.logs.length;
  console.log('...num events produced = ', nEvents);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for evolving: ${Number(txReceipt.gasUsed)}`);
  console.log(`Gas used per evolution: ${Number(txReceipt.gasUsed)/num}`);
  const tokenId0 = response.logs[0].args["_tokenId"].toString();
  const tokenIdLast = response.logs[nEvents-1].args["_tokenId"].toString();
  console.log('first evolved tokenId = ', tokenId0);
  console.log('first evolved tokenId = ', tokenIdLast);
}


module.exports = async (callback) => {
  try {
    const [alice, bob] = await web3.eth.getAccounts();

    console.log('Deploying batchMinter with alice as owner...');
    const batchMinter = await LaosBatchMinter.new(alice);
    console.log('...batchMinter deployed at ', batchMinter.address);
    console.log('...batchMinter owner is alice as expected? ', alice === await batchMinter.batchMinterOwner());

    const precompileAddress = await batchMinter.precompileAddress();
    const precompileContract = await EvolutionCollection.at(precompileAddress);

    console.log('...precompileContract owner is batchMinter?... ', batchMinter.address === await precompileContract.owner());

    console.log('Precompile owner can be queried via batchMinter and matches direct query? ', await precompileContract.owner() === batchMinter.address);

    console.log('Alice can batch mint using the batchMinter...');
    await batchMint(batchMinter, alice, bob);

    // console.log('DONE');return;

    console.log('Alice can mint using the batchMinter...');
    const tokenId1 = await mint(batchMinter, alice, bob);

    console.log('Alice can batch evolve using the batchMinter...');
    await batchEvolve(batchMinter, alice, tokenId1);

    console.log('Bob cannot mint using the batchMinter...');
    await assertReverts(() => mint(batchMinter, bob, alice));

    console.log('Bob cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, bob, alice));

    console.log('Alice cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, alice, bob));

    console.log('alice owns batchMinter?...',  alice == await batchMinter.batchMinterOwner());

    console.log('bob cannot transfer batchMinter ownership...');
    await assertReverts(() => batchMinter.transferBatchMinterOwnership(bob, {from: bob}));

    console.log('Alice transfers batchMinter ownership to bob...');
    await batchMinter.transferBatchMinterOwnership(bob);

    console.log('PrecompileContract owner remains unchanged as expected?... ', batchMinter.address === await precompileContract.owner());
    console.log('batchMinter owner has changed as expected?... ', bob === await batchMinter.batchMinterOwner());

    console.log('Alice cannot change the owner of the precompile using the precompile...');
    await assertReverts(() => precompileContract.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('Alice cannot change the owner of the precompile using the batchMinter...');
    await assertReverts(() => batchMinter.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('bob changes the ownership of the precompile using the batchMinter...');
    await batchMinter.transferOwnership(alice, {from: bob, gas: maxGas});
    console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
