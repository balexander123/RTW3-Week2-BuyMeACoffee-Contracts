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

    it('should have the correct balance after multiple coffee buys', async () => {
        const BUYER_NAME_1 = "Joe Blow";
        const MESSAGE_1 = "Thanks dude!";
        const BUYER_NAME_2 = "Jane Doe";
        const MESSAGE_2 = "Keep it up!";
        const ETHER_AMOUNT = '1';

        const initialBalance = await ethers.provider.getBalance(buyMeACoffee.address);

        // First coffee buy
        await buyMeACoffee.buyCoffee(BUYER_NAME_1, MESSAGE_1, { value: ethers.utils.parseEther(ETHER_AMOUNT) });

        // Second coffee buy
        await buyMeACoffee.buyCoffee(BUYER_NAME_2, MESSAGE_2, { value: ethers.utils.parseEther(ETHER_AMOUNT) });

        const finalBalance = await ethers.provider.getBalance(buyMeACoffee.address);
        const memos = await buyMeACoffee.getMemos();

        assert.equal(finalBalance.toString(), (initialBalance.add(ethers.utils.parseEther(ETHER_AMOUNT).mul(2))).toString(), 'Contract balance did not increase correctly');
        assert.equal(memos.length, 2, 'Memos were not added');
        assert.equal(memos[0].name, BUYER_NAME_1, 'Buyer name is not correct in the first memo');
        assert.equal(memos[0].message, MESSAGE_1, 'Message is not correct in the first memo');
        assert.equal(memos[1].name, BUYER_NAME_2, 'Buyer name is not correct in the second memo');
        assert.equal(memos[1].message, MESSAGE_2, 'Message is not correct in the second memo');
    });

    it('should deduct the proper amount when a withdrawal is executed by contract owner', async () => {
        const OWNER = await buyMeACoffee.getOwner();

        // Get initial balance of the contract and the owner
        const initialContractBalance = await ethers.provider.getBalance(buyMeACoffee.address);
        const initialOwnerBalance = await ethers.provider.getBalance(OWNER);

        // Get the gas price
        const gasPrice = await ethers.provider.getGasPrice();

        // Estimate the gas cost of the withdrawal operation
        const gasEstimate = await buyMeACoffee.estimateGas.withdrawTips();

        // Calculate the gas cost
        const gasCost = gasEstimate.mul(gasPrice);

        // Execute withdrawal
        await buyMeACoffee.withdrawTips();

        // Get final balance of the contract and the owner
        const finalContractBalance = await ethers.provider.getBalance(buyMeACoffee.address);
        const finalOwnerBalance = await ethers.provider.getBalance(OWNER);

        // Check if the contract balance has decreased by the correct amount
        assert.equal(finalContractBalance.toString(), '0', 'Contract balance did not decrease correctly');

        // Check if the owner balance has increased by the correct amount
        // Subtract the gas cost from the expected final balance
        const expectedFinalBalance = initialOwnerBalance.add(initialContractBalance).sub(gasCost);
        assert.equal(finalOwnerBalance.toString(), expectedFinalBalance.toString(), 'Owner balance did not increase correctly');
    });

    it('should not allow non-owner to withdraw', async () => {
        // Get the owner of the contract
        const BUYER_NAME = "Joe Blow";
        const MESSAGE = "Thanks dude!";
        const ETHER_AMOUNT = '1';

        // buy coffee
        await buyMeACoffee.buyCoffee(BUYER_NAME, MESSAGE, { value: ethers.utils.parseEther(ETHER_AMOUNT) });
        const memos = await buyMeACoffee.getMemos();
        const NON_OWNER = memos[0].address;

        // Try to execute a withdrawal from the non-owner account
        try {
            await buyMeACoffee.connect(NON_OWNER).withdrawTips();
            assert.fail('Non-owner was able to withdraw');
        } catch (err) {
            assert.ok('Non-owner was not able to withdraw');
        }
    });

});