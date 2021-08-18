const TDex = artifacts.require("TDex");
const Token = artifacts.require("Token");

module.exports = async function(deployer) {
    // deploy token
    await deployer.deploy(Token);
    const token = await Token.deployed();
    // deploy exchange
    await deployer.deploy(TDex, token.address);
    const tdex = await TDex.deployed();
    // transfer all tokens to tdex. This can be adjusted.
    await token.transfer(tdex.address, "1000000000000000000000000")
};

/* 
This takes our smart contract and deploys it to the blockchain using Truffle. 
Truffle uses artifacts which are JSON objects of the smart contract.
Migration files in Truffle are a lot like Migrations to change a database
like you would with SQL or MongoDB. Except we do not have to export down because
smart contracts are immutable. Once deployed they can not be changed. Any further 
deployments are essentially copies of the original existing smart contract. 

we can redeploy by running truffle migrate --reset from the root of our project
*/