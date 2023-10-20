const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("BuyMeACoffee", accounts => {
    let buyMeACoffee;

    beforeEach(async () => {
        const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
        buyMeACoffee = await BuyMeACoffee.deploy();
        await buyMeACoffee.deployed();
        console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);
    });

    it("Should deploy the contract and check the initial state", async function () {
        const signer = await ethers.getSigner();
        const signerAddress = await signer.getAddress();
        assert.equal(await buyMeACoffee.getOwner(), signerAddress, "The signer is not the owner");
    });

    it('should allow buying a coffee', async () => {
        const BUYER_NAME = "Joe Blow";
        const MESSAGE = "Thanks dude!";
        const ETHER_AMOUNT = '1';

        const initialBalance = await ethers.provider.getBalance(buyMeACoffee.address);

        await buyMeACoffee.buyCoffee(BUYER_NAME, MESSAGE, { value: ethers.utils.parseEther(ETHER_AMOUNT) });

        const finalBalance = await ethers.provider.getBalance(buyMeACoffee.address);
        const memos = await buyMeACoffee.getMemos();

        assert.equal(finalBalance.toString(), (initialBalance.add(ethers.utils.parseEther(ETHER_AMOUNT))).toString(), 'Contract balance did not increase correctly');
        assert.equal(memos.length, 1, 'Memo was not added');
        assert.equal(memos[0].name, BUYER_NAME, 'Buyer name is not correct in the memo');
        assert.equal(memos[0].message, MESSAGE, 'Message is not correct in the memo');
    });

});