const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosPublicMinter = artifacts.require("LaosPublicMinter");
const truffleAssert = require('truffle-assertions');

const createCollectionAddress = "0x0000000000000000000000000000000000000403";
const maxGas = 5000000;

async function tryWithRetries(func, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log('...attempt: ', i);
      await func();
      console.log('...attempt: ', i, 'failed as expected');
      return; // if the function succeeds, exit
    } catch (error) {
      if (error.message.includes('revert')) {
        throw error; // If the error is a revert, we throw it
      }
      console.log(`Retrying... (${i + 1}/${retries})`);
      if (i === retries - 1) throw error; // after max retries, throw the error
    }
  }
}

async function assertReverts(func) {
  // Sometimes the failure to exeecture the TX is not due to a revert of the code,
  // but, e.g., to the node refusing connection, etc.
  // This code makes sure that the TX fails due to a revert, otherwise tries a few more
  // times until it truly reverts.
  await tryWithRetries(async () => {
    await truffleAssert.fails(
        func,
        truffleAssert.ErrorType.REVERT,
    );
  });
}

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

async function mint(contract, sender, recipient) {
  const response = await contract.mintWithExternalURI(recipient, random32bit(), 'dummyURI', {
    from: sender,
    gas: maxGas,
  });
  truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
}

module.exports = async (callback) => {
  try {
    const [alice, bob] = await web3.eth.getAccounts();

    console.log('connecting to createCollection precompile...');
    const createCollectionContract = await EvolutionCollectionFactory.at(createCollectionAddress);

    console.log('creating a collection with owner = alice...');
    const response = await createCollectionContract.createCollection(alice);
    const newCollectionAddress = response.logs[0].args["_collectionAddress"];
    console.log('newCollectionAddress at ', newCollectionAddress);
    const precompileContract = await EvolutionCollection.at(newCollectionAddress);
    console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());

    console.log('alice can mint...');
    await mint(precompileContract, alice, bob);

    console.log('bob cannot mint...');
    await assertReverts(mint(precompileContract, bob, alice));

    console.log('deploying publicMinter...');
    const publicMinter = await LaosPublicMinter.new(alice);
    console.log('deploying publicMinter... deployed at ', publicMinter.address);
    console.log('Public Minter owner is alice as expected? ', alice === await publicMinter.publicMinterOwner());

    console.log('set owner of precompile to public minter...');
    await precompileContract.transferOwnership(publicMinter.address);
    console.log('precompileContract owner is publicMinter?... ', publicMinter.address === await precompileContract.owner());

    console.log('setPrecompileAddress of publicMinter to newly created collection...');
    await publicMinter.setPrecompileAddress(newCollectionAddress);
    console.log('Precompile Address matches created collection precompile?...',  newCollectionAddress == await publicMinter.precompileAddress());

    console.log('Precompile owner can be queried via publicMinter and matches direct query? ', await precompileContract.owner() === publicMinter.address);

    console.log('Bob cannot mint using the publicMinter...');
    await assertReverts(mint(publicMinter, bob, alice));

    console.log('Bob cannot mint using the precompile neither...');
    await assertReverts(mint(precompileContract, bob, alice));

    console.log('alice cannot mint using the precompile neither...');
    await assertReverts(mint(precompileContract, alice, bob));

    console.log('alice owns public minter?...',  alice == await publicMinter.publicMinterOwner());

    console.log('alice can mint using the publicMinter since she owns it...');
    await mint(publicMinter, alice, bob);

    console.log('bob is not authorized to enable public minting...');
    await assertReverts(publicMinter.enablePublicMinting({from: bob, gas: maxGas}));

    console.log('alice enables public minting...');
    await publicMinter.enablePublicMinting();
    console.log('is public minting enabled?...', await publicMinter.isPublicMintingEnabled());

    console.log('bob can now mint using the publicMinter...');
    await mint(publicMinter, bob, alice);

    console.log('bob cannot mint using the precompile...');
    await assertReverts(mint(precompileContract, bob, alice));

    console.log('bob cannot transfer public minting ownership...');
    await assertReverts(publicMinter.transferPublicMinterOwnership(bob, {from: bob, gas: maxGas}));

    console.log('alice transfers public minting ownership to bob...');
    await publicMinter.transferPublicMinterOwnership(bob);

    console.log('precompileContract owner has changed as expected?... ', bob === await precompileContract.owner());

    console.log('alice cannot disable public minting...');
    await assertReverts(publicMinter.disablePublicMinting({from: alice, gas: maxGas}));

    console.log('bob disables public minting...');
    await publicMinter.disablePublicMinting({from: bob, gas: maxGas});

    console.log('alice cannot mint anymore...');
    await assertReverts(mint(publicMinter, alice, bob));

    console.log('bob can since he owns the publicMinter...');
    await mint(publicMinter, bob, alice);

    console.log('alice cannot change the owner of the precompile using the precompile...');
    await assertReverts(precompileContract.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('alice cannot change the owner of the precompile using the publicMinter...');
    await assertReverts(publicMinter.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('bob changes the ownership of the precompile using the publicMinter...');
    await publicMinter.transferOwnership(alice, {from: bob, gas: maxGas});
    console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
