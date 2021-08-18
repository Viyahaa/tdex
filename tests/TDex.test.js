const { assert } = require("chai");
const { default: Web3 } = require("web3");

const TDex = artifacts.require("TDex");
const Token = artifacts.require("Token");

// Importing Chai library
require("chai")
    .use(require("chai-as-promised"))
    .should()

// converts tokens to enhance readability
function tokens(number) {
    return web3.utils.toWei(number, "ether")
}

contract("TDex", ([deployer, investor]) => {

    let token, tdex

    before(async () => {
        token = await Token.new()
        tdex = await TDex.new(token.address)
        await token.transfer(tdex.address, tokens("1000000"))
        
    })

    describe("Token deployment", async () => {
        it("Token has a name", async () => {
            const name = await token.name()
            assert.equal(name, "TDex Token")
        })
    })

    describe("TDex deployment", async () => {
        it("contract has a name", async () => {
            const name = await tdex.name()
            assert.equal(name, "TDex Instant Exchange")
        })

        it("contract has tokens", async () => {
            let balance = await token.balanceOf(tdex.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })

    describe("purchase tokens", async () => {
        let result
        before(async () => {
            // purchase tokens
            result = await tdex.buyTokens({from: investor, value: web3.utils.toWei("1", "ether")})
        })
        it("allows users to purchase tokens for a fixed price", async () => {
            // check for investor balance after making a purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens("100"))

            // check tdex balance after purchase
            let tdexBalance
            tdexBalance = await token.balanceOf(tdex.address)
            assert.equal(tdexBalance.toString(), tokens("999900"))

            // check ethereum balance of smart contract after token purchase
            tdexBalance = await web3.eth.getBalance(tdex.address)
            assert.equal(tdexBalance.toString(), web3.utils.toWei("1", "ether"))

            // check logs to verify that the event has been called with the correct data
            const event = result.logs[0].args;
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens("100").toString())
            assert.equal(event.rate.toString(), "100")
            

        })
    })

    describe("sell tokens", async () => {
        let result
        before(async () => {
            // investor MUST approve the smart contract to spend the tokens. 
            await token.approve(tdex.address, tokens("100"), {from: investor})
            result = await tdex.sellTokens(tokens("100"), {from: investor}) 
        })
        it("allows users to sell tokens for a fixed price", async () => {
            // check for investor balance after making a sale
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens("0"))

            // check tdex balance after purchase
            let tdexBalance
            console.log(tdex.address)
            tdexBalance = await token.balanceOf(tdex.address)
            assert.equal(tdexBalance.toString(), tokens("1000000"))
            tdexBalance = await web3.eth.getBalance(tdex.address)
            assert.equal(tdexBalance.toString(), web3.utils.toWei("0", "Ether"))

            // check logs to verify that the event has been called with the correct data
            const event = result.logs[0].args;
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens("100").toString())
            assert.equal(event.rate.toString(), "100")

            // ensures that seller has sufficient balance of tokens
            await tdex.sellTokens(tokens("50000"), {from: investor}).should.be.rejected
        })
        
    })
})