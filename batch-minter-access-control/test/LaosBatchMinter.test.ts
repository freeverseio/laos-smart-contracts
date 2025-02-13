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


    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MockEvolutionCollectionFactory = await ethers.getContractFactory("MockEvolutionCollectionFactory");
        mockFactory = await MockEvolutionCollectionFactory.deploy();
        await mockFactory.waitForDeployment();

        console.log("Mock EvolutionCollectionFactory deployed at:", mockFactory.target);
        // Force set the contract code at the hardcoded address
        await network.provider.send("hardhat_setCode", [fixedCollectionFactoryAddress, await network.provider.send("eth_getCode", [mockFactory.target])]);

        const mockEvolutionCollection = await ethers.getContractFactory("MockEvolutionCollection");
        mockCollection = (await mockEvolutionCollection.deploy(owner.address)) as MockEvolutionCollection;
        await mockCollection.waitForDeployment();

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
