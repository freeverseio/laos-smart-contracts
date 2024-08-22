const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosBatchMinter = artifacts.require("LaosBatchMinter");
const truffleAssert = require('truffle-assertions');

const createCollectionAddress = "0x0000000000000000000000000000000000000403";
const maxGas = 5000000;

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
  const response = await contract.mintWithExternalURI(recipient, random32bit(), 'dummyURI', {
    from: sender,
    gas: maxGas,
  });
  truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for minting: ${txReceipt.gasUsed}`);
}

async function batchMint(contract, sender, recipient, num = 10) {
  const recipients = Array(num).fill(recipient);
  const randoms = random32bitArray(nun);
  const uris = Array(num).fill('dummyURI');

  const response = await contract.mintWithExternalURIBatch(recipients, randoms, uris, {
    from: sender,
    gas: num * maxGas,
  });
  // truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  console.log('Num events = ', response.logs.length);
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
  const txReceipt = await web3.eth.getTransactionReceipt(response.tx);
  console.log(`Gas used for minting: ${txReceipt.gasUsed}`);
}



module.exports = async (callback) => {
  try {
    const [alice, bob] = await web3.eth.getAccounts();

    console.log('Connecting to createCollection precompile...');
    const createCollectionContract = await EvolutionCollectionFactory.at(createCollectionAddress);

    console.log('Creating a collection with owner = alice...');
    const response = await createCollectionContract.createCollection(alice);
    const newCollectionAddress = response.logs[0].args["_collectionAddress"];
    // const newCollectionAddress = "0xFFFFfFFFfFFFFfFFFfFFFfFE000000000000003F"; // response.logs[0].args["_collectionAddress"];
    console.log('...newCollectionAddress at ', newCollectionAddress);
    const precompileContract = await EvolutionCollection.at(newCollectionAddress);
    console.log('...precompileContract owner is alice?... ', alice === await precompileContract.owner());

    console.log('Deploying batchMinter with alice as owner...');
    const batchMinter = await LaosBatchMinter.new(alice);
    // const batchMinter = await LaosBatchMinter.at("0x486b1E07070544b5006448A6b47C978d17169cb8");
    console.log('...batchMinter deployed at ', batchMinter.address);
    console.log('...batchMinter owner is alice as expected? ', alice === await batchMinter.batchMinterOwner());


    console.log('Set owner of precompile to batchMinter...');
    await precompileContract.transferOwnership(batchMinter.address);
    console.log('...precompileContract owner is batchMinter?... ', batchMinter.address === await precompileContract.owner());

    console.log('SetPrecompileAddress of batchMinter to newly created collection...');
    await batchMinter.setPrecompileAddress(newCollectionAddress);
    console.log('...precompile address matches created collection precompile?...',  newCollectionAddress == await batchMinter.precompileAddress());

    console.log('Precompile owner can be queried via batchMinter and matches direct query? ', await precompileContract.owner() === batchMinter.address);

    console.log('Alice can mint using the batchMinter...');
    await mint(batchMinter, alice, bob);

    console.log('Bob cannot mint using the batchMinter...');
    await assertReverts(() => mint(batchMinter, bob, alice));

    console.log('Bob cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, bob, alice));

    console.log('Alice cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, alice, bob));

    console.log('alice owns batchMinter?...',  alice == await batchMinter.batchMinterOwner());

    console.log('bob cannot transfer batchMinter ownership...');
    await assertReverts(() => batchMinter.transferBatchMinterOwnership(bob, {from: bob, gas: maxGas}));

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
