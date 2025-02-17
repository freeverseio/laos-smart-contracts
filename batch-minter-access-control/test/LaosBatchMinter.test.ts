import { ethers, network } from "hardhat";
import { expect } from "chai";
import { LAOSMinterControlled, MockEvolutionCollectionFactory, MockEvolutionCollection, EvolutionCollection } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LAOSMinterControlled", function () {
    let minter: LAOSMinterControlled;
    let mockFactory: MockEvolutionCollectionFactory;
    let mockCollection: MockEvolutionCollection;
    let precompileCollection: EvolutionCollection;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    const fixedCollectionFactoryAddress = "0x0000000000000000000000000000000000000403";
    const fixedPrecompileAddress = "0x0000000000000000000000000000000000000404";
    const nullAddressHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const dummySlot = 32;
    const dummyURI = 'dummyURI';
    const dummyTokenId = '46166684518705834130388065924615409827291950694273196647937022621816907952627';

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MockEvolutionCollectionFactory = await ethers.getContractFactory("MockEvolutionCollectionFactory");
        mockFactory = await MockEvolutionCollectionFactory.deploy();
        await mockFactory.waitForDeployment();
        await network.provider.send("hardhat_setCode", [fixedCollectionFactoryAddress, await network.provider.send("eth_getCode", [mockFactory.target])]);

        const LAOSMinterControlled = await ethers.getContractFactory("LAOSMinterControlled");
        minter = (await LAOSMinterControlled.deploy(owner.address)) as LAOSMinterControlled;
        await minter.waitForDeployment();

        const mockEvolutionCollection = await ethers.getContractFactory("MockEvolutionCollection");
        mockCollection = await mockEvolutionCollection.deploy(await minter.getAddress());
        await mockCollection.waitForDeployment();
        await network.provider.send("hardhat_setCode", [fixedPrecompileAddress, await network.provider.send("eth_getCode", [mockCollection.target])]);

        precompileCollection = await ethers.getContractAt("EvolutionCollection", fixedPrecompileAddress);
    });

    it("Should set the correct initial parameters", async function () {
        expect(await minter.precompileAddress()).to.equal(fixedPrecompileAddress);
        expect(await precompileCollection.getAddress()).to.equal(fixedPrecompileAddress);
        expect(await precompileCollection.owner()).to.equal(await minter.getAddress());

        expect(await precompileCollection.tokenURI(dummyTokenId)).to.equal('42');
    });

    it("mocked precompileCollection returns as expected", async function () {
        expect(await precompileCollection.getAddress()).to.equal(fixedPrecompileAddress);
        expect(await precompileCollection.owner()).to.equal(await minter.getAddress());
        expect(await precompileCollection.tokenURI(dummyTokenId)).to.equal('42');
    });

    it("Should set role codes as expected", async function () {
        expect(await minter.METADATA_ADMIN_ROLE()).to.equal("0xe02a0315b383857ac496e9d2b2546a699afaeb4e5e83a1fdef64376d0b74e5a5");
        expect(await minter.MINTER_ROLE()).to.equal("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6");
        expect(await minter.DEFAULT_ADMIN_ROLE()).to.equal(nullAddressHash);
        expect(await minter.getRoleAdmin(await minter.METADATA_ADMIN_ROLE())).to.equal(nullAddressHash);
    });

    it("Should assign roles as expected", async function () {
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
        expect(await minter.hasRole(await minter.MINTER_ROLE(), owner.address)).to.equal(true);
        expect(await minter.hasRole(await minter.METADATA_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Admin can assign roles", async function () {
        await minter.grantRole(await minter.DEFAULT_ADMIN_ROLE(), addr1.address);
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(true);
    });

    it("Not admin cannot assign roles", async function () {
        await expect(minter.connect(addr1).grantRole(await minter.DEFAULT_ADMIN_ROLE(), addr2.address))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, nullAddressHash);
    });    

    it("MINTER_ROLE can mint", async function () {
        await expect(minter.connect(owner).mintWithExternalURI(addr2.address, dummySlot, dummyURI))
            .to.not.be.reverted;
        await expect(minter.connect(owner).mintWithExternalURIBatch([addr2.address], [dummySlot], [dummyURI]))
            .to.not.be.reverted;
    });   
    
    it("Not MINTER_ROLE cannot mint", async function () {
        await expect(minter.connect(addr1).mintWithExternalURI(addr2.address, dummySlot, dummyURI))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.MINTER_ROLE());
        await expect(minter.connect(addr1).mintWithExternalURIBatch([addr2.address], [dummySlot], [dummyURI]))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.MINTER_ROLE());

    });   

    it("MINTER_ROLE can evolve", async function () {
        await expect(minter.connect(owner).evolveWithExternalURI(dummyTokenId, dummyURI))
          .to.not.be.reverted;
        await expect(minter.connect(owner).evolveWithExternalURIBatch([dummyTokenId], [dummyURI]))
            .to.not.be.reverted;
    });   

    it("Not MINTER_ROLE cannot evolve", async function () {
        await expect(minter.connect(addr1).evolveWithExternalURI(dummyTokenId, dummyURI))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.MINTER_ROLE());
        await expect(minter.connect(addr1).evolveWithExternalURIBatch([dummyTokenId], [dummyURI]))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.MINTER_ROLE());
    });   

    it("METADATA_ADMIN_ROLE can transferPrecompileCollectionOwnership", async function () {
        expect(await minter.hasRole(await minter.METADATA_ADMIN_ROLE(), owner.address)).to.equal(true);
        expect(await precompileCollection.owner()).to.equal(await minter.getAddress());
        await expect(minter.connect(owner).transferPrecompileCollectionOwnership(addr2.address))
            .to.not.be.reverted;
    });   
    
    it("Not METADATA_ADMIN_ROLE cannot transferPrecompileCollectionOwnership", async function () {
        await expect(minter.connect(addr1).transferPrecompileCollectionOwnership(addr1.address))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.METADATA_ADMIN_ROLE());
    }); 
    
    it("Not METADATA_ADMIN_ROLE cannot transferPrecompileCollectionOwnership via direct call", async function () {
        await expect(precompileCollection.connect(addr1).transferOwnership(addr1.address))
            .to.be.revertedWithCustomError(mockCollection, "OwnableUnauthorizedAccount")
            .withArgs(addr1.address);
    }); 
    
    it("Only DEFAULT_ADMIN_ROLE can grantRoles, including the DEFAULT_ADMIN_ROLE itself", async function () {
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);

        // granting METADATA_ADMIN_ROLE:
        expect(await minter.hasRole(await minter.METADATA_ADMIN_ROLE(), addr1.address)).to.equal(false);
        await expect(minter.connect(owner).grantRole(await minter.METADATA_ADMIN_ROLE(), addr1.address))
          .to.not.be.reverted;
        expect(await minter.hasRole(await minter.METADATA_ADMIN_ROLE(), addr1.address)).to.equal(true);

        // granting MINTER_ROLE:
        expect(await minter.hasRole(await minter.MINTER_ROLE(), addr1.address)).to.equal(false);
        await expect(minter.connect(owner).grantRole(await minter.MINTER_ROLE(), addr1.address))
          .to.not.be.reverted;
        expect(await minter.hasRole(await minter.MINTER_ROLE(), addr1.address)).to.equal(true);

        // The new address having METADATA_ADMIN_ROLE cannot grant new roles:
        await expect(minter.connect(addr1).grantRole(await minter.METADATA_ADMIN_ROLE(), addr2.address))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await minter.DEFAULT_ADMIN_ROLE());

        // Granting the DEFAULT_ADMIN_ROLE:
        await expect(minter.connect(owner).grantRole(await minter.DEFAULT_ADMIN_ROLE(), addr1.address))
            .to.not.be.reverted;
  
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), addr1.address)).to.equal(true);

        // New DEFAULT_ADMIN_ROLE can assign roles
        await expect(minter.connect(addr1).grantRole(await minter.MINTER_ROLE(), addr2.address))
            .to.not.be.reverted;

        // New DEFAULT_ADMIN_ROLE can revoke previous DEFAULT_ADMIN_ROLE
        await expect(minter.connect(addr1).revokeRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address))
            .to.not.be.reverted;
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(false);
        await expect(minter.connect(owner).grantRole(await minter.METADATA_ADMIN_ROLE(), addr2.address))
            .to.be.revertedWithCustomError(minter, "AccessControlUnauthorizedAccount")
            .withArgs(owner.address, await minter.DEFAULT_ADMIN_ROLE());
    });   
});
