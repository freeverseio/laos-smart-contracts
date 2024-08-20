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
const LaosPublicMinter = artifacts.require("LaosPublicMinter");
const createCollectionAddress = "0x0000000000000000000000000000000000000403";

module.exports = async (callback) => {
  try {
    const accounts = await web3.eth.getAccounts();

    console.log('connecting to createCollection precompile...');
    const createCollectionContract = await EvolutionCollectionFactory.at(createCollectionAddress);

    console.log('deploying publicMinter...');
    const publicMinterOwner = accounts[0];
    const publicMinter = await LaosPublicMinter.new(publicMinterOwner);
    console.log('deploying publicMinter... deployed at ', publicMinter.address);

    const _pubMinterOwner = await publicMinter.publicMinterOwner();
    console.log('Public Minter owner is as expected? ', publicMinterOwner === _pubMinterOwner);

    console.log('creating a collection with owner = publicMinter...');
    const response = await createCollectionContract.createCollection(publicMinter.address);
    const newCollectionAddress = response.logs[0].args["_collectionAddress"];
    console.log('newCollectionAddress at ', newCollectionAddress);

    console.log('setPrecompileAddress of publicMinter to newly created collection...');
    await publicMinter.setPrecompileAddress(newCollectionAddress);

    console.log('Precompile Address matches created collection?...',  newCollectionAddress == await publicMinter.precompileAddress());

    const collectionOwner = await publicMinter.owner();
    console.log('Collection owner coincides with publicMinter? ', collectionOwner === publicMinter.address);

    console.log('trying to mintWithExternalURI...');
    const randomSlot32bit = Math.floor(Math.random() * Math.pow(2, 32));
    try {
      await publicMinter.mintWithExternalURI(accounts[1], randomSlot32bit, 'dummyURI');
      console.log('ERROR: minting by unauthorized account worked without having used public minting!!!');
    } catch {
      console.log('Minting failed as expected, since public minting is not enabled');
    }

    console.log('enabling public minting');
    await publicMinter.enablePublicMinting();

    console.log('is public minting enabled?...', await publicMinter.isPublicMintingEnabled());

    console.log('mintWithExternalURI... again');
    const response2 = await publicMinter.mintWithExternalURI(accounts[1], randomSlot32bit, 'dummyURI');
    const tokenId = response2.logs[0].args["_tokenId"].toString();
    console.log('new tokenId = ', tokenId);
    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};