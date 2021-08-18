pragma solidity ^0.5.0;
import "./Token.sol";

contract TDex {
    string public name = "TDex Instant Exchange";
    Token public token; // creates token state variable
    uint public rate = 100;

    event BuyTokens(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    event SellTokens(
        address account, 
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // change this once we have a more verbose number of tokens.
        // for now we will use a fixed price of 100 tokens for 1 ether
        uint tokenAmount = msg.value  * rate;
        // ensures exchange has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);
        // transfers tokens to user
        token.transfer(msg.sender, tokenAmount);

        // trigger an event.
        emit BuyTokens(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public payable {
        // user can not sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate exchange rate
        uint etherAmount = _amount / rate;

        // checks to make sure tdex has enough coins
        require(address(this).balance >= etherAmount);

        // sell tokens for ether
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);
        
        // trigger an event.
        emit SellTokens(msg.sender, address(token), _amount, rate);
    }
}