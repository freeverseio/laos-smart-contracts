import { ethers, network } from "hardhat";
import { expect } from "chai";
import { LaosBatchMinter, MockEvolutionCollectionFactory, MockEvolutionCollection } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LaosBatchMinter", function () {
    let minter: LaosBatchMinter;
    let mockFactory: MockEvolutionCollectionFactory;
    let mockCollection: MockEvolutionCollection;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    const fixedCollectionFactoryAddress = "0x0000000000000000000000000000000000000403";
    const fixedCollectionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const nullAddress = ethers.toBeHex(0, 20);


    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MockEvolutionCollectionFactory = await ethers.getContractFactory("MockEvolutionCollectionFactory");
        mockFactory = await MockEvolutionCollectionFactory.deploy();
        await mockFactory.waitForDeployment();

        await network.provider.send("hardhat_setCode", [fixedCollectionFactoryAddress, await network.provider.send("eth_getCode", [mockFactory.target])]);
        console.log("Mock EvolutionCollectionFactory deployed at:", mockFactory.target, 'but network mocked to believe it is at ', fixedCollectionFactoryAddress);

        const mockEvolutionCollection = await ethers.getContractFactory("MockEvolutionCollection");
        mockCollection = (await mockEvolutionCollection.deploy(owner.address)) as MockEvolutionCollection;
        await mockCollection.waitForDeployment();
        console.log("Mock EvolutionCollectionFactory deployed at:", await mockCollection.getAddress());

        const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
        minter = (await LaosBatchMinter.deploy(owner.address)) as LaosBatchMinter;
        await minter.waitForDeployment();
    });

    it("Should set the correct intiial parameters", async function () {
        expect(await minter.precompileAddress()).to.equal(fixedCollectionAddress);
        expect(await minter.owner()).to.equal(owner.address);
        expect(await minter.METADATA_ADMIN_ROLE()).to.equal("0xe02a0315b383857ac496e9d2b2546a699afaeb4e5e83a1fdef64376d0b74e5a5");
        expect(await minter.MINTER_ROLE()).to.equal("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6");
        expect(await minter.DEFAULT_ADMIN_ROLE()).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
        expect(await minter.hasRole(await minter.MINTER_ROLE(), owner.address)).to.equal(true);
        expect(await minter.hasRole(await minter.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });
});
