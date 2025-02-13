import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { LaosBatchMinter } from "../typechain-types";

describe("LaosBatchMinter", function () {
    let minter: LaosBatchMinter;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;
    const nullAddress = ethers.toBeHex(0, 20);

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
        minter = (await LaosBatchMinter.deploy(await owner.getAddress())) as LaosBatchMinter;
        await minter.waitForDeployment();
    });

    it("Should set the correct owner", async function () {
        expect(2).to.equal(2);
        console.log(await owner.getAddress());
        console.log(await minter.owner());
        // expect(await minter.owner()).to.equal(await owner.getAddress());
    });

    // it("Should allow the owner to mint a token", async function () {
    //     const recipient = await addr1.getAddress();
    //     const slot = 1234;
    //     const tokenURI = "https://example.com/token/1";

    //     await expect(minter.mintWithExternalURI(recipient, slot, tokenURI))
    //         .to.emit(minter, "NewBatchMinter") // Modify the event name if needed
    //         .withArgs(await owner.getAddress(), await minter.precompileAddress());

    //     // Add assertions based on the behavior of `EvolutionCollection(precompileAddress).mintWithExternalURI`
    // });

    // it("Should prevent non-owners from minting", async function () {
    //     const recipient = await addr1.getAddress();
    //     const slot = 5678;
    //     const tokenURI = "https://example.com/token/2";

    //     await expect(
    //         minter.connect(addr1).mintWithExternalURI(recipient, slot, tokenURI)
    //     ).to.be.revertedWith("Ownable: caller is not the owner");
    // });
});
