//
// Script that tests using proxy contracts to create a collection and mint
// To mint, the owner of the collection must be set to the proxy contract
//
// To run this script, compile first
//      ./node_modules/.bin/truffle compile
// and then execute:
//      ./node_modules/.bin/truffle exec scripts/test_flow.js  --network zombienet
//
// All commands here can be done 1-by-1, manually, by doing:
//      ./node_modules/.bin/truffle console --network zombienet

const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosPublicMinter = artifacts.require("LaosPublicMinter");
const createCollectionAddress = "0x0000000000000000000000000000000000000403";

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

async function mint(contract, sender, recipient) {
    const response = await contract.mintWithExternalURI(recipient, random32bit(), 'dummyURI', { 
      from: sender, 
      gas: 5000000 
    });
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
    try {
      await mint(precompileContract, bob, alice);
    } catch {
      console.log('Minting by bob failed as expected');
    }

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

    console.log('Bob cannot mint using the publicMinter...')
    try {
      await mint(publicMinter, bob, alice);
    } catch {
      console.log('Minting by bob failed as expected');
    }
    console.log('Bob cannot mint using the precompile neither...')
    try {
      await mint(precompileContract, bob, alice);
    } catch {
      console.log('Minting by bob failed as expected');
    }
    console.log('alice cannot mint using the precompile neither...')
    try {
      await mint(precompileContract, alice, bob);
    } catch {
      console.log('Minting by alice failed as expected');
    }

    console.log('alice can mint using the publicMinter since she owns it...')
    await mint(precompileContract, alice, bob);

    console.log('bob is not authorized to enable public minting...');
    try {
      await publicMinter.enablePublicMinting({from: bob, gas: 5000000}); 
    } catch {
      console.log('bob managed to do an onlyOwner action!');
    }

    console.log('alice enables public minting...');
    await publicMinter.enablePublicMinting();
    console.log('is public minting enabled?...', await publicMinter.isPublicMintingEnabled());

    console.log('bob can now mint using the publicMinter...')
    await mint(publicMinter, bob, alice);

    console.log('bob cannot mint using the precompile...')
    try {
      await mint(precompileContract, bob, alice);
    } catch {
      console.log('Minting by alice failed as expected');
    }

    console.log('transferring public minting ownership');
    const newOwner = bob;
    await publicMinter.transferPublicMinterOwnership(newOwner);

    console.log('precompileContract owner has changed as expected?... ', newOwner === await precompileContract.owner());

    try {
      await precompileContract.mintWithExternalURI(bob, randomSlot32bit2, 'dummyURI', { 
        from: alice, 
        gas: 5000000 
      });
      console.log('ERROR: minting by unauthorized account worked!!!');
    } catch {
      console.log('Minting failed as expected, since ownership of precompile contract was transferred');
    }
    console.log('mintWithExternalURI... again');
    const response3 = await publicMinter.mintWithExternalURI(bob, random32bit(), 'dummyURI', { 
      from: newOwner, 
      gas: 5000000 
    });

    const tokenId2 = response3.logs[0].args["_tokenId"].toString();
    console.log('new tokenId = ', tokenId2);

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};