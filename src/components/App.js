import React, { Component } from 'react';
import Web3 from "web3";
import './App.css';
import Token from "../abis/Token.json";
import TDex from "../abis/TDex.json";
import Navbar from "./Navbar";
import Main from "./Main";

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance})

    // creates a JS version of the smart contract. We will use this to interact with the contract directly
    const newtworkId = await web3.eth.net.getId()
    // load token
    const tokenData = Token.networks[newtworkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({token})
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      console.log(tokenBalance.toString())
      this.setState({tokenBalance: tokenBalance.toString()})
    } else {
      window.alert("Token contract is not deployed to detected network. Please try changing your network in MetaMask!")
    }

    //load TDex
    const tdexData = TDex.networks[newtworkId]
    if(tdexData) {
      const tdex = new web3.eth.Contract(TDex.abi, tokenData.address)
      this.setState({tdex})
    } else {
      window.alert("You are on the wrong network. Please change it in MetaMask!")
    }

    this.setState({loading: false})
  }

  

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("Non Ethereum browser detected. Please connect with MetaMask!")
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({loading: true})
    this.state.tdex.methods.buyTokens().send({value: etherAmount, from: this.state.account}).on("transactionHash", (hash) => {
      this.setState({loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: "",
      token: {},
      tdex: {},
      tokenBalance: "0",
      ethBalance: "0",
      loading: true,
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main 
                  ethBalance={this.state.ethBalance} 
                  tokenBalance={this.state.tokenBalance} 
                  buyTokens={this.buyTokens}
                />
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: "600px"}}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
