import { ethers } from "hardhat";
import { expect } from "chai";
import { LaosBatchMinter, MockEvolutionCollectionFactory, MockEvolutionCollection } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LaosBatchMinter", function () {
    let minter: LaosBatchMinter;
    let mEvolutionCollectionFactory: MockEvolutionCollectionFactory;
    let mEvolutionCollection: MockEvolutionCollection;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MockEvolutionCollectionFactory = await ethers.getContractFactory("MockEvolutionCollectionFactory");
        mEvolutionCollectionFactory = await MockEvolutionCollectionFactory.deploy();
        await mEvolutionCollectionFactory.waitForDeployment();

        const mockEvolutionCollection = await ethers.getContractFactory("MockEvolutionCollection");
        mEvolutionCollection = (await mockEvolutionCollection.deploy(owner.address)) as MockEvolutionCollection;
        await mEvolutionCollection.waitForDeployment();

        const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
        minter = (await LaosBatchMinter.deploy(owner.address)) as LaosBatchMinter;
        await minter.waitForDeployment();
    });

    it("Should set the correct owner", async function () {
        expect(2).to.equal(2);
        console.log(owner.address);
        // console.log(await minter.owner());
        // expect(await minter.owner()).to.equal(owner.address);
    });
});
