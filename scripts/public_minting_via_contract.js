const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosPublicMinter = artifacts.require("LaosPublicMinter");
const truffleAssert = require('truffle-assertions');

const createCollectionAddress = "0x0000000000000000000000000000000000000403";
const maxGas = 5000000;

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
    await truffleAssert.fails(
      mint(precompileContract, bob, alice),
      truffleAssert.ErrorType.REVERT,
    );

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
    await truffleAssert.fails(
      mint(publicMinter, bob, alice),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('Bob cannot mint using the precompile neither...');
    await truffleAssert.fails(
      mint(precompileContract, bob, alice),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('alice cannot mint using the precompile neither...');
    await truffleAssert.fails(
      mint(precompileContract, alice, bob),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('alice can mint using the publicMinter since she owns it...');
    await mint(precompileContract, alice, bob);

    console.log('bob is not authorized to enable public minting...');
    await truffleAssert.fails(
      publicMinter.enablePublicMinting({from: bob, gas: maxGas}),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('alice enables public minting...');
    await publicMinter.enablePublicMinting();
    console.log('is public minting enabled?...', await publicMinter.isPublicMintingEnabled());

    console.log('bob can now mint using the publicMinter...');
    await mint(publicMinter, bob, alice);

    console.log('bob cannot mint using the precompile...');
    await truffleAssert.fails(
      mint(precompileContract, bob, alice),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('bob cannot transfer public minting ownership...');
    await truffleAssert.fails(
      publicMinter.transferPublicMinterOwnership(bob, {from: bob, gas: maxGas}),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('alice transfers public minting ownership to bob...');
    await publicMinter.transferPublicMinterOwnership(bob);

    console.log('precompileContract owner has changed as expected?... ', bob === await precompileContract.owner());

    console.log('alice cannot disable public minting...');
    await truffleAssert.fails(
      publicMinter.disablePublicMinting({from: alice, gas: maxGas}),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('bob disables public minting...');
    await publicMinter.disablePublicMinting({from: bob, gas: maxGas});

    console.log('alice cannot mint anymore...');
    await truffleAssert.fails(
      mint(precompileContract, alice, bob),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('bob can since he owns the publicMinter...');
    await mint(precompileContract, bob, alice);

    console.log('alice cannot change the owner of the precompile using the precompile...');
    await truffleAssert.fails(
      precompileContract.transferOwnership(alice, {from: alice, gas: maxGas}),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('alice cannot change the owner of the precompile using the publicMinter...');
    await truffleAssert.fails(
      publicMinter.transferOwnership(alice, {from: alice, gas: maxGas}),
      truffleAssert.ErrorType.REVERT,
    );

    console.log('bob changes the ownership of the precompile using the publicMinter...');
    await publicMinter.transferOwnership(alice, {from: bob, gas: maxGas});

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
