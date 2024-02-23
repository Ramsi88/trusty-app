/**
 * TRUSTY-dApp v0.1
 * Copyright (c) 2024 Ramzi Bougammoura
 */

import { BigNumber, Contract, providers, utils, ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
//import {Web3} from "web3";

//FACTORY_ADDRESS,
import { FACTORY_ABI, CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

const { keccak256 } = require("ethereum-cryptography/keccak");

const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

import Doc from "../components/doc";
import Api from "../components/api";

const ethDecimals = 10**18;

const getNetworkState = false;

/** SEPOLIA
 * v.0.1.2 0xE3f25232475D719DD89FF876606141308701B713
 * v.0.1.1 0x852217deaf824FB313F8F5456b9145a43557Be37
*/
/** RMS VAULTY TRUST GOERLI FACTORY ADDRESS
* v.0.1.1 0xB4Fa8AdC5863788e36adEc7521d412BEa85d6Dbe
* v.0.1 0xA2bDd8859ac2508A5A6b94038d0482DD216A59A0
* v.0.0 0xebb477aaabaedd94ca0f5fd4a09aa386a9290394
*/
const version = [
  "0xebb477aaabaedd94ca0f5fd4a09aa386a9290394",
  "0xA2bDd8859ac2508A5A6b94038d0482DD216A59A0",
  "0xB4Fa8AdC5863788e36adEc7521d412BEa85d6Dbe"
];

/**
 * TOKENS ADDRESSES
*/
const tokens = {
  mainnet:[
    {
      symbol: "WETH",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      decimals: 18
    },
    {
      symbol: "WBTC",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      decimals: 8
    },
    {
      symbol: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6
    },
    {
      symbol: "USDC",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6
    },
  ],
  sepolia:[],
  goerli: [
    {
      symbol: "WETH",
      address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      decimals: 18
    },
    {
      symbol: "MTK",
      address: "0x14cF758d08A1F1Cf7797348231bb71a69D8944f4",
      decimals: 18
    },
  ]
}

//{block,price,gas,usdBalance}
export default function Home() {
  const networks = {
    //mainnet : {id: 1, name: "Ethereum Mainnet", contract:""},
    goerli: {id: 5, name: "Goerli", contract:"0xB4Fa8AdC5863788e36adEc7521d412BEa85d6Dbe"},
    sepolia: {id: 11155111, name: "Sepolia", contract:"0xE3f25232475D719DD89FF876606141308701B713"},
    //polygon: {id: 137, name: "Polygon Mainnet", contract:""},
    //mumbai: {id: 80001, name: "Mumbai Testnet", contract:""},
    //base: {id: 8453, name: "Base", contract:""},
    //optimism: {id: 10, name: "Optimism", contract:""},
    //arbitrum: {id: 42161, name: "Arbitrum", contract:""},
  }

  const [network,setNetwork] = useState({});
  const ETHERSCAN_URL = "https://goerli.etherscan.io/tx/";
  const [vNum,setvNum] = useState();
  //const [FACTORY_ADDRESS,setFACTORY_ADDRESS] = useState(version[vNum]); //version[vNum];
  const [FACTORY_ADDRESS,setFACTORY_ADDRESS] = useState("");
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const gas = useRef(0);
  const block = useRef(0);

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  const [balanceFactory, setBalanceFactory] = useState(0);
  // contractsIdsMinted keeps track of the number of ContractsIds that have been created
  const [contractsIdsMinted, setContractsIdsMinted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // This variable is the `0` number in form of a BigNumber
  const zero = BigNumber.from(0);  
  const [deposit, setDeposit] = useState(zero);  
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(zero);

  // Price Enabler
  const [trustyPrice, setTrustyPrice] = useState(0);
  const [trustyPriceSet, setTrustyPriceSet] = useState(0);
  const [priceEnabler,setPriceEnabler] = useState();

  // ownersToTrusty
  const [ownersToTrusty, setOwnerToTrusty] = useState([]);
  const [owner1, setOwner1] = useState();
  const [owner2, setOwner2] = useState();
  const [owner3, setOwner3] = useState();
  const [confirms, setConfirms] = useState(2);

  const countOwners = useRef(0);
  const [addMoreOwners,setAddMoreOwners] = useState(false);
  const [moreOwners,setMoreOwners] = useState([]);
  const [inputOwnersValue,setInputOwnersValue] = useState('');

  //WHITELIST
  const [maxWhitelisted, setMaxWhitelisted] = useState(0);
  const [addressesWhitelisted, setAddressesWhitelisted] = useState(0);
  const [factoryWhitelist,setFactoryWhitelist] = useState([]);
  const [trustyWhitelist,setTrustyWhitelist] = useState([]);
  const [inputFactoryWhitelistValue, setInputFactoryWhitelistValue] = useState('');
  const [inputTrustyWhitelistValue, setInputTrustyWhitelistValue] = useState('');
  //const [getFactoryWhitelist, setGetFactoryWhitelist] = useState([])
  const [getTrustyWhitelist, setGetTrustyWhitelist] = useState([]);
  const [factoryMaxWhitelist, setFactoryMaxWhitelist] = useState(100);

  //TIME_LOCK
  const [timeLock,setTimeLock] = useState(0);
  const [toggleTimeLock,setToggleTimeLock] = useState(false);

  //Trusty Owners
  const [trustyOwners,setTrustyOwners] = useState();

  //Trusty created list & deposit
  const [totalTrusty, setTotalTrusty] = useState(0);
  const [TRUSTY_ADDRESS, setTRUSTY_ADDRESS] = useState([]);
  const [trustyID, setTrustyID] = useState(null);
  const [trustyBalance, setTrustyBalance] = useState(0);
  

  // isOwner? True
  const [imOwner, setImOwner] = useState(false);

  //let array = [];
  let trustyBox = [];
  const trustyTokens = useRef([])

  // TX parameter
  const [totalTx, setTotalTx] = useState(0);
  const [TRUSTY_TXS, setTRUSTY_TXS] = useState([]);
  const [txTo, setTxTo] = useState("");
  const [txValue, setTxValue] = useState(zero);
  const [txData, setTxData] = useState("0");

  const [isCallToContract,setIsCallToContract] = useState(false);
  const [_debug,setDebug] = useState(false);
  const [toggleExecuted, setToggleExecuted] = useState(false);

  const [_txTo, _setTxTo] = useState(0);
  const [_txValue, _setTxValue] = useState(zero);

  const [dashboard,setDashboard] = useState(true);
  const [create,setCreate] = useState(false);
  const [manage,setManage] = useState(false);
  const [TXS,setTXS] = useState(false);
  const [submit,setSubmit] = useState(false);
  const [about,setAbout] = useState(false);

  //Notifications
  let [notification, setNotification] = useState();

  /**
   * createTrusty: Create a Trusty MultiSig Contract from TrustyFactory
   */
  const createTrusty = async () => {
    const array = []
    array.push(owner1);
    array.push(owner2);
    array.push(owner3);
    array.push(...moreOwners)
    setOwnerToTrusty(array);
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      // call the mint from the contract to mint the Trusty //'["","",""],1'
      const tx = await contract.createContract(array, confirms, {
        // value signifies the cost of one trusty contract which is "0.1" eth.
        // We are parsing `0.1` string to ether using the utils library from ethers.js
        //value: utils.parseEther("0.1"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      checkAll();
      notifica("You successfully created a Trusty Wallet... "+JSON.stringify(tx.hash));
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
    }
  };

  /**
   * connectWallet: Connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getFactoryOwner: calls the contract to retrieve the Factory owner
   */
  const getFactoryOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();

      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      // call the owner function from the contract
      const _owner = await contract.owner();

      if (FACTORY_ADDRESS != null && address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
        const factoryB = (await provider.getBalance(FACTORY_ADDRESS) / ethDecimals).toString();
        setBalanceFactory(factoryB);
      } else {
        setIsOwner(false);
      }
    } catch (err) {
      console.error(err.message);
      notifica(err.message.toString());
    }
  };

  async function withdraw() {
    try {
      console.log("admin withdraw");
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const withdraw = await contract.withdraw();
      console.log(withdraw);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function priceConfig() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const priceConf = await contract.trustyPriceConfig(utils.parseEther(trustyPriceSet));
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function depositFactory() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const tx = await contract.fallback({ value: utils.parseEther(deposit), gasLimit: 300000 });
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const getPriceEnabler = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const getPriceEnabler = (await contract._priceEnabled);
      setPriceEnabler(getPriceEnabler);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const trustyPriceEnable = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const setPriceEnabler = await contract.trustyPriceEnable();
      setPriceEnabler(setPriceEnabler);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const setMaxWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const setMaxConf = await contract.setMaxWhitelist(factoryMaxWhitelist);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const addAddressToFactoryWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const addFactoryWhitelist = await contract.addAddressToWhitelist(factoryWhitelist);
      setLoading(true);
      // wait for the transaction to get mined
      await addFactoryWhitelist.wait();
      setLoading(false);
      getDetails();
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const removeAddressFromFactoryWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const removeFactoryWhitelist = await contract.removeFromFactoryWhitelist(factoryWhitelist);
      setLoading(true);
      // wait for the transaction to get mined
      await removeFactoryWhitelist.wait();
      setLoading(false);
      getDetails();
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const getTrustyIDWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const getTrusty = await contract.getTrustyWhitelist(trustyID);
      setGetTrustyWhitelist(getTrusty)
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const addToTrustyWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const addToTrusty = await contract.addToTrustyWhitelist(trustyID, trustyWhitelist);
      setLoading(true);
      // wait for the transaction to get mined
      await addToTrusty.wait();
      setLoading(false);
      //getTrustyIDWhitelist()
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const removeFromTrustyWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const removeFromTrusty = await contract.removeFromTrustyWhitelist(trustyID, trustyWhitelist);
      setLoading(true);
      // wait for the transaction to get mined
      await removeFromTrusty.wait();
      setLoading(false);
      getTrustyIDWhitelist()
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  /**
   * getContractsIdsMinted: gets the number of tokenIds that have been minted
   */
  const getContractsIdsMinted = async (x) => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner(true);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      // call the contractsId from the factory contract
      const _contractAddr = await contract.contracts(x);
      setTRUSTY_ADDRESS(_contractAddr);
      trustyBox.push({ id: x, address: _contractAddr });
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
    }
  };

  /**
   * getTtrustyIds: gets the number of trusty that have been created
   */
  const getTrustyId = async () => {
    let array = [];

    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner(true);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      let total = await contract.totalTrusty();
      setTotalTrusty(total);
      total = total.toString();

      setContractsIdsMinted(total);

      // call the tokenIds from the contract
      for (let i = 0; i < total; i++) {
    
        const _imOwner = await contract.imOwner(i);
        const _contractAddr = await contract.contracts(i);

        if (_imOwner === true) {
          setTRUSTY_ADDRESS(_contractAddr);
          array.push({ id: i, address: _contractAddr });
          setImOwner(true);

          getContractsIdsMinted(i);
        } else {
          //setImOwner(false);
        }
      }
      renderActions();
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
    }
  };

  // FACTORY DETAILS
  async function getDetails() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      let total = await contract.totalTrusty();
      setTotalTrusty(total);
      total = total.toString();
      setContractsIdsMinted(total);
      const price = (await contract._price() / ethDecimals).toString().slice(0, 10);
      setTrustyPrice(price);
      const getPriceEnabler = await contract._priceEnabled();
      setPriceEnabler(getPriceEnabler);
      const getMaxWhitelisted = await contract.maxWhitelistedAddresses();
      setMaxWhitelisted(getMaxWhitelisted);
      const getAddressesWhitelisted = await contract.numAddressesWhitelisted();
      setAddressesWhitelisted(getAddressesWhitelisted);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // CHECK TRUSTY BALANCE
  async function checkTrustyId() {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    const genericErc20Abi = require('constants/erc20.json');

    const getTokens = [];
    if(tokens[network.name.toLowerCase()]){
      tokens[network.name.toLowerCase()].forEach(async (token) => {
        const trustyAddr = TRUSTY_ADDRESS.filter(id=>{if(id.id==trustyID){return id.address}})[0].address
        const tokenContractAddress = token.address;
        const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer);
  
        const balance = (await contract.balanceOf(trustyAddr)).toString();
  
        getTokens.push(`(${token.symbol}): ${balance}`)
      });
    }
    
    trustyTokens.current = getTokens;
    
    const balance = (await contract.contractReadBalance(trustyID) / ethDecimals).toString();
    setTrustyBalance(balance);
  }

  // CHEK TRUSTY OWNERS
  async function checkTrustyOwners() {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    
    const owners = (await contract.contractReadOwners(trustyID)).toString();
    setTrustyOwners(owners);
  }

  // DEPOSIT to TRUSTY
  async function depositToTrusty() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const _contractAddr = await contract.depositContract(trustyID, utils.parseEther(addEther), { value: utils.parseEther(addEther), gasLimit: 300000 });
      setLoading(true);
      // wait for the transaction to get mined
      await _contractAddr.wait();
      setLoading(false);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // SUBMIT TX to Trusty
  async function submitTxTrusty() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      if(isCallToContract) {
        let obj = encodeMethod(txData);
        const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), obj.hex, timeLock);
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        getTxTrusty();
        notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
      } else {
        const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), ethers.utils.hexValue([...Buffer.from(txData)]), timeLock);
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        getTxTrusty();
        notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
      }
    } catch (err) {
      setLoading(false);
      console.log(err?.message);
      notifica(err?.message.toString());
      setLoading(false);
    }
  }

  // UTILS FUNCTION
  function encodeMethod(str) {
    let data = txData;
    let obj = {
      method: "",
      types:"",
      args:"",
      hex:"",
      hexn:0,
      ptr:0,
      argLoc:"",
      arg:[""]
    };
    if (str) {      
      let bytes = [];
      let types = "";
      let args = [];
      let hex = "";
      
      let isParam = false;
      let isArr = false;
      let _arg = 0;
      let _argArr = 0;
      let tmp = [];

      for (let i=0;i<data.length;i++) {
        if (!isParam) {
          types+=data[i];
        } else {          
          if(data[i]==="," && isParam === true && isArr === false){
            _arg++;
            obj.arg[_arg]="";    
          }
          else if(data[i]==="[" && isParam === true && !isArr) {
            console.log("startArr",data[i]);isArr=true;
          }
          else if(data[i]==="]" && isParam === true && isArr) {
            console.log("endArr",data[i]);isArr=false;
          }
          else{
            args+=data[i];
            obj.arg[_arg]+=data[i];        
          }
        }
        if (data[i]===")") {
          isParam = true;
        }         
      }
      
      bytes.push(types);
      bytes.push(args);

      obj.types = types;
      obj.args = args;
      obj.method = ethers.utils.keccak256([...Buffer.from(types)]).slice(0,10);
      obj.hex = `${obj.method}`;

      for(let i=0;i<obj.arg.length;i++){
        // 1 >>>>> array
        if (obj.arg[i].includes(",")) {
          console.log(">>>array to serialize",obj.arg[i]);
          let tmp = [""];
          let iter = 0;
          for (let x=0;x<obj.arg[i].length;x++) {
            if(obj.arg[i][x]===","){
              iter++;
              tmp[iter] = "";
            } else {
              tmp[iter]+=obj.arg[i][x];
            }
          }
          /* DataLocation | DataLength | DataElements           
          sam(bytes,bool,uint256[])dave,true,[1,2,3]
          0xa5643bf2
          0000000000000000000000000000000000000000000000000000000000000060 //32bytes 0hexn => 0x60 = 96bytes+
          0000000000000000000000000000000000000000000000000000000000000001 //64bytes 1hexn => 0x40 = 64bytes+ 
          00000000000000000000000000000000000000000000000000000000000000a0 //96bytes 2hexn => 0xa0 - 160byte+
          0000000000000000000000000000000000000000000000000000000000000004 //128bytes
          6461766500000000000000000000000000000000000000000000000000000000 //160bytes
          0000000000000000000000000000000000000000000000000000000000000003 //192bytes
          0000000000000000000000000000000000000000000000000000000000000001 //224bytes
          0000000000000000000000000000000000000000000000000000000000000002 //256bytes
          0000000000000000000000000000000000000000000000000000000000000003 //288bytes
          */
          //Data-Length
          obj.hexn++;
          obj.hex+=`${thirdTopic(tmp.length.toString(16),true)}`;          
       
          for(let y=0;y<tmp.length;y++){
            //Data-Value
            obj.hexn++;
            obj.hex+=`${thirdTopic(tmp[y],true)}`;
          }
          continue;
        }
        // 2 >>>>> array
        if(isNaN(obj.arg[i]) && obj.arg[i] !== "true" && obj.arg[i] !== "false") {
          //Data-Loc
          obj.hexn++;
          continue;
        } else {
        }
        // 3 >>>>> number array
        if(obj.arg[i].length > 0 ) {
          obj.hexn++;
          obj.hex+=`${thirdTopic(obj.arg[i])}`;
        };
      }
      return obj;
    } else {
      //
    }
  }

  function unpack(str) {
    if (str) {
      let bytes = [];
      for (var i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        bytes.push(char >>> 8);
        bytes.push(char & 0xFF);
      }
      return bytes;
    } else {return null}
  }

  function string2Bin(str) {
    if (str) {
      var result = [];
      for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i).toString(2));
      }
      return result;
    } else {return null}
  }

  function convertToHex(str) {
    if (str) {
      var hex = '';
      for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
      }
      return hex;
    } else {return null}
  }

  function hex2string(hexx) {
    if (hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    } else {return null}
  }

  function firstTopic(arg) {
    if (arg) {
      //const eventSignature = "Transfer(address,address,uint256)";
      const eventSignature = arg;
      const bytes = utf8ToBytes(eventSignature);
      const digest = keccak256(bytes);
      return toHex(digest);
    } else {return null}
  }

  function secondTopic(arg) {
    if (arg) {
      // add the address and left-pad it with zeroes to 32 bytes then return the value
      //const address = "28c6c06298d514db089934071355e5743bf21d60";
      const address = arg;
      return "0".repeat(24) + address; 
    } else {return null}
  }

  function thirdTopic(arg,fromArr=false) {
    if (arg) {
      // add the address and left-pad it with zeroes to 32 bytes then return the value
      // 
      //createContract(address[],uint256)[0x,0x,0x],2
      //confirmTransaction(uint,bool,address,bytes)2,true,0xaBc4406d3Bb25C4D39225D516f9C3bbb8AA2CAD6,una stringa casuale
      //const address = "28c6c06298d514db089934071355e5743bf21d60";
      let paramArr = 0;
      // is BOOLEAN
      if (arg==="true") {        
        arg="1";
      } else if (arg==="false") {        
        arg="0";
      }
      // is type ADDRESS left-padded
      else if (arg.startsWith("0x")) {
        arg=arg.slice(2);
        const topic = arg;
        return "0".repeat(64-arg.length)+topic;      
      } 
      // is NUMBER
      else if (!isNaN(arg)) {
        arg=parseInt(arg).toString(16);      
      } 
      // is BYTES string right-padded
      else if (isNaN(arg)) {        
        arg=convertToHex(arg);
        const topic = arg;
        return topic + "0".repeat(64-arg.length);
      }
      // is BYTES
      else {
        arg=arg;
      }
      const topic = arg;
      return "0".repeat(64-arg.length) + topic;
    } 
  }

  function pack(arg) {
    if (arg) {
      return '0x' + secondTopic(firstTopic(arg));
    } else {return null}
  }

  // GET TX TRUSTY
  async function getTxTrusty() {
    if(trustyID != null) {
      try {
        let box = [];
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const txs = await contract.contractReadTxs(trustyID);

        setTotalTx(txs);

        for (let i = 0; i < txs; i++) {
          const gettxs = await contract.getTx(trustyID, i);
          
          box.push({ 
            id: i,
            to: gettxs[0],
            value: gettxs[1] / ethDecimals,
            data: gettxs[2], executed: gettxs[3],
            confirmations: gettxs[4],
            block:gettxs[5]?gettxs[5]:"N/A",
            timelock: gettxs[6]?gettxs[6]:"N/A",
          });
        }

        setTRUSTY_TXS(box);

      } catch (err) {
        console.log(err.message);
      }
    }
  }

  // CONFIRM TX
  const confirmTxTrusty = async (id) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const txs = await contract.trustyConfirm(trustyID, id);
      setLoading(true);
      // wait for the transaction to get mined
      await txs.wait();
      setLoading(false);
      getTxTrusty();
      notifica(`You confirmed the Trusty tx id ${id}...`+txs.hash);
    } catch (err) {
      setLoading(false);
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // REVOKE TX
  const revokeTxTrusty = async (id) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const txs = await contract.trustyRevoke(trustyID, id);
      setLoading(true);
      // wait for the transaction to get mined
      await txs.wait();
      setLoading(false);
      getTxTrusty();
      notifica(`You revoked Trusty tx id ${id}... ${txs.hash}`);
    } catch (err) {
      setLoading(false);
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // EXECUTE TX
  const executeTxTrusty = async (id) => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const txs = await contract.trustyExecute(trustyID, id, { gasLimit: 300000 });
      setLoading(true);
      // wait for the transaction to get mined
      await txs.wait();
      setLoading(false);
      getTxTrusty();
      notifica(`You succesfully executed the Trusty tx id ${id}... ${txs.hash}`);
    } catch (err) {
      setLoading(false);
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function notifica(msg) {
    setNotification(msg.toString());
    setTimeout(()=>{clear()},15000);
  }

  function increaseV(vNum) {
    
    if(vNum<version.length){
      setvNum(vNum+1);
    }  else {
      setvNum(0);
    }
    setFACTORY_ADDRESS(version[vNum]);
    //clearState();
    
    /*
    if (trustyID != null) {
      getFactoryOwner();
      getDetails();
      checkAll();
      //console.log("getting balance..", trustyID);
      checkTrustyId();
      //console.log("getting txs..", trustyID);
      getTxTrusty();
      //console.log("getting owners..", trustyID);
      checkTrustyOwners();
    }
    */
  }

  //STATE CLEAR
  function clearState() {
    setIsCallToContract(false);
    setLoading(false);
    //setIsOwner(false);
    trustyTokens.current = []
  }

  function clear() {
    setNotification(null);
  }

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider); //new Web3(provider); //"https://mainnet.infura.io/v3/"

    // If user is not connected to the Goerli network, let them know and throw an error
    const {chainId} = await web3Provider.getNetwork(); //await web3Provider.eth.defaultNetworkId //

    for (let i of Object.keys(networks)) {
      let id = networks[i]
      if (id.id === chainId && id.contract !== "") {
        setWalletConnected(true);
        setNetwork({id:chainId,name:id.name,contract:id.contract}) //{id:5,name:"goerli",contract:"0xB4Fa8AdC5863788e36adEc7521d412BEa85d6Dbe"}
        setFACTORY_ADDRESS(id.contract)
        //notifica(`[NETWORK]: Connected to Trusty Factory on ${id.id} : ${id.name} - ${id.contract}`)
        break
      } else {
        //notifica(`[NETWORK]: No available Trusty Factory contract, please switch the network to find an available one... (${Object.keys(networks)})`)
      }
    }
   
    if (needSigner) {
      const signer = web3Provider.getSigner();
      
      setAccount(await signer.getAddress())
      setOwner1(await signer.getAddress());
      setBalance((await signer.getBalance() / ethDecimals).toString().slice(0, 10));
      
      return signer;
    }
    
    return web3Provider;
  };

  const checkNetwork = (chainId) => {
    for (let i of Object.keys(networks)) {
      let id = networks[i] //.id
      if (id.id === chainId && id.contract !== "") {
        setWalletConnected(true);
        setFACTORY_ADDRESS(id.contract)
        setNetwork({id:chainId,name:id.name})
        return true
      }
    }
    return false
  }

  const switchNetwork = async (id = network.id) => {
    if (window.ethereum) {
      try {
        // Try to switch the network
        let res = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x'+ id.toString(16) }], // Check networks.js for hexadecimal network ids
        });
      } catch(err) {
        notifica(err.message)
      }
    }
  }

  async function checkAll() {
    if (walletConnected) {
      try {
        let box = [];
        const provider = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        let total = await contract.totalTrusty();
        let hasOwner = false;
        for (let i = 0; i < total; i++) {

          const _imOwner = await contract.imOwner(i);
          const _contractAddr = await contract.contracts(i);

          if (_imOwner == true) {
            box.push({ id: i, address: _contractAddr });
          }
        }
        setContractsIdsMinted(total.toString());
        setTRUSTY_ADDRESS(box);
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }
  }

  useEffect(()=>{
    if (getNetworkState) {
      setTimeout(async () => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        
        block.current= await signer.provider.getBlockNumber();
        gas.current = parseInt(ethers.utils.formatUnits(await ethers.getDefaultProvider().getGasPrice(), 'gwei')); //parseInt((await signer.getFeeData()).maxFeePerGas._hex);
        
      },3000)
    }
  },[])

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    setTrustyID(null);    
    setTRUSTY_ADDRESS([])
    setTRUSTY_TXS([])
    clearState()
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    try {
      if (!walletConnected) {
        // Assign the Web3Modal class to the reference object by setting it's `current` value
        // The `current` value is persisted throughout as long as this page is open
        web3ModalRef.current = new Web3Modal({
          network: network.name, //"goerli",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
      } else {
        getProviderOrSigner(true);
        checkAll();
        
        // set an interval to get the number of Trusty Ids minted every 5 seconds
        setInterval(async () => {
          getProviderOrSigner(true);
          
          if (trustyID != null) {
            getTxTrusty(); //<-----
          }
        }, 15 * 1000);
      }
    } catch(err) {
      console.log("[ERROR]:",err)
      notifica(err.message.toString());
    }
  }
  , [account]
  );

  useEffect(() => {
    clearState() // <----
    if (trustyID != null && walletConnected) {
      try {
        getFactoryOwner();
        getDetails();
      } catch(err) {
        console.log("[ERROR]:",err)
        notifica(err.message.toString());
      }
    }
  }, [account]);

  useEffect(() => {
    clearState();
    setTrustyWhitelist([]); //<-----
    try {
      if (trustyID != null && walletConnected) {
        checkAll();
        checkTrustyId();
        getTxTrusty();
        checkTrustyOwners();
        getTrustyIDWhitelist()
      } 
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }, [account,trustyID]);
  
  useEffect(() => {
    try {
      setTRUSTY_TXS([]); //<----
      setInterval(async () => {
        if (trustyID != null && walletConnected) { // 
          getFactoryOwner();
          getDetails();
          checkAll();
          checkTrustyId();
          getTxTrusty();    
          getTrustyIDWhitelist()   
        }
      }, 5* 1000);
    } catch(err) {
      console.log("[ERROR]:",err)
      notifica(err.message.toString());
    } 
  }
  ,[account]
  );
  
  // Handle Account change
  useEffect(()=>{
    //const ethereum = getProviderOrSigner(true);
    //ethereum.on('chainChanged', handleChainChanged);

    // Reload the page when they change networks
    if(account!=account){handleChainChanged()}

  },[account]);

  // Handle network change  
  useEffect(()=>{
    if (network.name !== null && walletConnected) {
      setFACTORY_ADDRESS(null)
      setTRUSTY_ADDRESS([])
      setTrustyID(null);
      setTRUSTY_TXS([])
      setTotalTx(0)

      checkNetwork()

      checkAll();
      getFactoryOwner();
      getDetails();  
    }
  },[network.name])

  useEffect(()=>{
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        handleChainChanged()
      })
      window.ethereum.on('accountsChanged', () => {
        handleChainChanged()
      })
    }    
  })

  // Network
  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  // More Owners
  const handleOwnersChange = (e) => {setInputOwnersValue(e.target.value);}

  const handleOwnersAdd = (e) => {
    if(inputOwnersValue !== "") {
      e.preventDefault();
      setMoreOwners([...moreOwners, inputOwnersValue]);
      countOwners.current++;
      setInputOwnersValue("");
    } else {notifica(`You must specify a valid owner to add!`)}
  }
  
  const clearOwnersInput = () => {
    countOwners.current = 0;
    setMoreOwners([]);
    setInputOwnersValue("");
    console.log(`clear ... [${confirms+countOwners.current}]`,moreOwners);
  }

  // Whitelists
  const handleFactoryWhitelistChange = (e) => {setInputFactoryWhitelistValue(e.target.value)}

  const handleTrustyWhitelistChange = (e) => {setInputTrustyWhitelistValue(e.target.value)}

  const handleFactoryWhitelistAdd = (e) => {
    if(inputFactoryWhitelistValue !== "") {
      e.preventDefault();
      setFactoryWhitelist([...factoryWhitelist, inputFactoryWhitelistValue]);
      setInputFactoryWhitelistValue("");
    } else {notifica(`You must specify a valid address to whitelist!`)}
  }

  const handleTrustyWhitelistAdd = (e) => {
    if(inputTrustyWhitelistValue !== "") {
      e.preventDefault();
      setTrustyWhitelist([...trustyWhitelist, inputTrustyWhitelistValue]);
      setInputTrustyWhitelistValue("");
    } else {notifica(`You must specify a valid address to be whitelisted!`)}
  }

  const clearFactoryWhitelistInput = () => {
    setFactoryWhitelist([]);
    setInputFactoryWhitelistValue("");
    console.log(`clearing whitelist ... [Factory Whitelist]`,factoryWhitelist);
  }

  const clearTrustyWhitelistInput = () => {
    setTrustyWhitelist([]);
    setInputTrustyWhitelistValue("");
    console.log(`clearing whitelist ... [Trusty Whitelist]`,trustyWhitelist);
  }
  
  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={()=>{connectWallet()}} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If wallet create Trusty
    if (walletConnected) {
      return (
        <div className={styles.inputDiv}>
          <button className={styles.button} onClick={createTrusty}>
            Create a Trusty
          </button>
          {trustyPrice} ETH
        </div>
      );
    }
  };

  // Render Input FORM
  /**
   * if (imOwner) > getTrustysTotal > getTrustyTxs > fundTrusty > Submit|Confirm|Execute|Revoke Tx
   */
  const renderInput = () => {
    if (true) {
      return (
        <div id="create" className={styles.inputDiv}>

          <legend>Configure your Trusty:</legend>
          <label>Owner 1(You):</label>
          <input
            type="text"
            placeholder={owner1}
            className={styles.input}
            disabled
          />
          <label>Owner 2:</label>
          <input
            type="text"
            placeholder='Owner 2'
            onChange={(e) => setOwner2(e.target.value || "0")}
            className={styles.input}
          />
          <label>Owner 3:</label>
          <input
            type="text"
            placeholder='Owner 3'
            onChange={(e) => setOwner3(e.target.value || "0")}
            className={styles.input}
          />
          <hr />

          <label>Need more owners? [<span  className={styles.col_exe}>{JSON.stringify(addMoreOwners)}</span>]</label>
          <input type="checkbox" onChange={(e)=>{setAddMoreOwners(!addMoreOwners)}}/>
          
          {addMoreOwners && (
            <div>
              <button className={styles.button3} onClick={handleOwnersAdd}>add owner</button>
              <button className={styles.button2} onClick={clearOwnersInput}>delete owners</button>

              <input
                type="text"
                placeholder={`Owner to add: ${countOwners.current}`}
                value={inputOwnersValue}
                //onChange={(e) => setMoreOwners(e.target.value || "0")}
                onChange={handleOwnersChange}
                className={styles.input}
              />

              {moreOwners.map((item,i)=>{
                return (
                  <li key={i}>{item}</li>             
                )
              })}                
            </div>
          )}        
          
          <hr/>

          <label>Minimum Threshold Confirmations:</label>
          <input
            type="number"
            placeholder="2"
            min="2"
            max={3 + countOwners.current}
            onChange={(e) => setConfirms(e.target.value || "2")}
            className={styles.input}
          />
        </div>
      );
    }
  };

  // MANAGE the TRUSTY
  const renderActions = () => {
    return (
      <div id="manage" className={styles.inputDiv}>
        <legend>Manage your Trusty</legend>
        <p>Trusty ID: <span className={styles.col_exe}>{trustyID}</span></p>
        
        {/* {renderOptions()} */}
        
        <label>Trusty selected: <span className={styles.col_exe}>{TRUSTY_ADDRESS.map(id=>{if(id.id==trustyID){return id.address}})}</span></label><br/>
        <br/>
        {trustyOwners != null && 
          <code>Trusty Owners: <span className={styles.col_data}>{trustyOwners}</span></code>
        }
        <p>Trusty Balance: <span className={styles.col_val}>{trustyBalance}</span> ETH</p>

        {trustyTokens.current != [] && trustyTokens.current.map((token,i)=>{
          return <p key={i}><code className={styles.col_dec} key={token}>{token}</code></p>
        })}

        <label>ETHER amount to deposit:</label>
        <input
          type="number"
          placeholder="<Amount of Ether> example: 0.10"
          min={0}
          step="0.01"
          onChange={(e) => setAddEther(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={depositToTrusty} className={styles.button}>Deposit to Trusty {trustyID}</button>

        <hr/>

        <label>TRUSTY WHITELIST</label>

        <ul>
          {getTrustyWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul>

        <p><i>(Use this field to add addresses to the whitelist in order to be able to send them any Ether or ERC20 token)</i></p>
        <p>* You will need also to insert the contract hash of the ERC20 token you need to interact with in order to approve it and make it available to transaction submit and execution</p>

        <input
          type="text"
          placeholder={`<Address to add to the Trusty's whitelist> example: 0x0123456789ABCdef...`}
          value={inputTrustyWhitelistValue}
          onChange={handleTrustyWhitelistChange}
          className={styles.input}
        /><br/>
        <button className={styles.button3} onClick={handleTrustyWhitelistAdd}>add to list</button>
        <button className={styles.button2} onClick={clearTrustyWhitelistInput}>clear list</button>  
        <hr/>

        {/* [To add]:{JSON.stringify(trustyWhitelist)} */}

        <code>
          <label>[To add]:</label>
          <ul>
          {trustyWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
          </ul>
        </code>

        <button className={styles.button} onClick={addToTrustyWhitelist}>ADD to Trusty Whitelist</button>
        <button className={styles.button} onClick={removeFromTrustyWhitelist}>REMOVE from Trusty Whitelist</button>

      </div>)
  };

  // SELECT the TRUSTY
  const renderOptions = () => {

    return (
      <div>
        {/*
        <select
          //onInput={checkTrustyId(depositTrusty.value)}
          onChange={(e) => {setTrustyID(e.target.value || null);}}
          className={styles.select}
        >
          <option value="">--Select Trusty address--</option>

          {TRUSTY_ADDRESS.map(item => (
            <option key={item.id} value={item.id}>{item.id} | {item.address}</option>
          ))}
        </select><br/>
        */}
        {/* {trustyOwners != null && 
          <code>Trusty Owners: <span className={styles.col_data}>{trustyOwners}</span></code>
        } */}

        {/* <input
          type="text"
          placeholder={depositTrusty}
          //placeholder={TRUSTY_ADDRESS[trustyID].address}
          value={depositTrusty}
          // onChange={(e) => setAddEther(e.target.value || "0")}
          className={styles.input}
          disabled
        /> */}

      </div>
    )
  }

  // CREATE TRUSTY TX
  const renderTrusty = () => {
    return (
      <div id="submit" className={styles.inputDiv}>
        <legend>Trusty TX proposal:</legend><br/>

        <label>to:</label><br/>

        {isCallToContract?
        <>
          <select className={styles.select} onChange={(e) => {setTxTo(e.target.value || "0x0");setTxValue(txValue || "0")}}>
            <option label="Select a contract:" defaultValue={`Select a contract`} disabled selected>Select an ERC20 Token or a contract to interact with or insert its address in the following field:</option>
            
            {tokens[network.name.toLowerCase()].map((item,i)=>{
              return(<option key={i} value={item.address}>Symbol: {item.symbol} Decimals: {item.decimals} Address: {item.address}</option>)
            })}
          </select>
          <br/>

          <input
            type="text"
            value={txTo}
            placeholder='contract address to interact with'
            onChange={(e) => {setTxTo(e.target.value || "0x0")}}
            className={styles.input}
          /><br/><br/>
        </>
        :
        <>
          <input
            type="text"
            placeholder='to'
            onChange={(e) => setTxTo(e.target.value || "0x0")}
            className={styles.input}
          /><br/><br/>
        </>
        }
        
        <label>Value:</label>
        {isCallToContract?
        <>
        <input
          type="number"
          placeholder='eth value'
          min={0}
          value={txValue || 0}
          step="0.01"
          onChange={(e) => setTxValue(e.target.value || "0")} // || "0"
          className={styles.input}
        /><br/><br/>
        </>
        :
        <>
        <input
          type="number"
          placeholder='eth value'
          min={0}
          step="0.01"
          onChange={(e) => setTxValue(e.target.value || "0")}
          className={styles.input}
        /><br/><br/>
        </>
        }

        <label>Data:</label>
        <input
          type="text"
          placeholder={isCallToContract?'`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`':''}
          value={txData !== "0" ? txData : isCallToContract?"":""}
          onChange={(e) => setTxData(e.target.value || "0")} //ethers.utils.parseEther(e.target.value)
          className={styles.input}
        /><br/><br/>

        <label>timelock [<code className={styles.col_exe}>{JSON.stringify(toggleTimeLock)}</code>]<input type="checkbox" onChange={()=>setToggleTimeLock(!toggleTimeLock)} checked={toggleTimeLock}/></label><br/>
        
        {toggleTimeLock && (
          <>
            <label> TIMELOCK </label>
            <input
              type="number"
              placeholder="0 for days"
              min="0"
              max={324000}
              value={timeLock}
              onChange={(e) => setTimeLock(e.target.value || "0")}
            />
            <label> Blocks/Day </label>
            <input type="number" placeholder="days in blocks" step="7200" value={7200} disabled/><br/>
            
            <hr/>
          </>
        )}        

        <label>calldata [<code className={styles.col_exe}>{JSON.stringify(isCallToContract)}</code>]</label>
        <input type="checkbox" onChange={(e)=>setIsCallToContract(!isCallToContract)} checked={isCallToContract}/><br/>
        <label>* Check this if you need to encode a call to a contract </label><br/>
        <label>** ERC20 transfer calldata example: `approve(address,uint256)0xabcdef123456,1000000000000000000` and then `transfer(address,uint256)0xabcdef123456,1000000000000000000` </label><br/>
        
        <div className={styles.inputDiv}>
          <p>to: {txTo}</p>
          <p>value: {txValue.toString()} ETH</p>
          <p>data: {txData} </p>
          {toggleTimeLock && (<p>timelock: {timeLock}</p>)}

          {isCallToContract && (
            <>
              <p>data serialized: {txData != null && encodeMethod(txData).hex.toString()}</p>
              <p>data encoding: {JSON.stringify(encodeMethod(txData))}</p>
            </>
          )}
          <button onClick={submitTxTrusty} className={styles.button}>Submit</button>

          {/* <label>* adv. debug: {JSON.stringify(_debug)}</label><br/>
          <input type="checkbox" onChange={(e)=>setDebug(!_debug)}/> */}

          {_debug && <>
          <div className={styles.description}>
            <code>data bytes | binary | hexadecimal | serialization
              <p>[data]: {txData}</p>
              <p>encoding: {JSON.stringify(encodeMethod(txData))}</p>
              <p>unpack: {unpack(txData)}</p>
              <p>string2Bin: {string2Bin(txData)}</p>
              <p>convertToHex: {convertToHex(txData)}</p>
              <p>bytes2hash2hex: {firstTopic(txData)}</p>
              <p>padding: {secondTopic(txData)}</p>
              <p>pack: {pack(txData)}</p>
              <p>string2hex: {hex2string(txData)}</p>
            </code>
          </div>
          </>}
        </div>
      </div>
    )
  }

  // GET TRUSTY TX
  const renderTx = (x, y) => {
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    return (
      <div className={styles.inputDiv}>
        Total TXs: {totalTx.toString()} <br />

        <label>filter executed [<code className={styles.col_exe}>{JSON.stringify(toggleExecuted)}</code>]</label>
        <input type="checkbox" onChange={()=>setToggleExecuted(!toggleExecuted)}/>

        <div className={styles.txs}>
          
          {!toggleExecuted && TRUSTY_TXS.map((item,i) => (
            (
            <span key={i} className={styles.tx}>
              <p>id: {item.id}</p>
              <p>To: {item.to.toString()}</p>
              <p>Value: <span className={styles.col_val}>{item.value.toString()} ETH</span></p>
              <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
              <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
              <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
              <p>Confirmations: {item.confirmations.toString()}</p>
              <p>Block: {item.block?item.block.toString():"N/A"}</p>
              <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p>

              {!item.executed == true && (
                <div>
                  <button onClick={() => { confirmTxTrusty(item.id) }} className={styles.button1}>confirm</button>
                  <button onClick={() => { revokeTxTrusty(item.id) }} className={styles.button2}>revoke</button>
                  <button onClick={() => { executeTxTrusty(item.id) }} className={styles.button3}>execute</button>

                </div>
              )}
            </span>
            )
          ))}

          {toggleExecuted && TRUSTY_TXS.map((item,i) => (
            !item.executed && (
            <span key={i} className={styles.tx}>
            <p>id: {item.id}</p>
            <p>To: {item.to.toString()}</p>
            <p>Value: <span className={styles.col_val}>{item.value.toString()} ETH</span></p>
            <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
            <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
            <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
            <p>Confirmations: {item.confirmations.toString()}</p>
            <p>Block: {item.block?item.block.toString():"N/A"}</p>
            <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p>

            {!item.executed == true && (
              <div>
                <button onClick={() => { confirmTxTrusty(item.id) }} className={styles.button1}>confirm</button>
                <button onClick={() => { revokeTxTrusty(item.id) }} className={styles.button2}>revoke</button>
                <button onClick={() => { executeTxTrusty(item.id) }} className={styles.button3}>execute</button>

              </div>
            )}
            </span>
            )
          ))}
        </div>
      </div>
    )
  };

  // FACTORY ADMIN
  const renderAdmin = () => {
    return (
      <div className={styles.inputDiv}>
        <h1>FACTORY OWNER Panel</h1>
        Factory Balance <code className={styles.col_val}>{balanceFactory}</code> ETH
        <button onClick={withdraw} className={styles.button1}>withdraw</button>
        <hr />
        <input
          type="number"
          placeholder='<set price of trusty in ether> example: 0.05'
          min={0}
          step="0.01"
          onChange={(e) => setTrustyPriceSet(e.target.value || "0")}
          className={styles.input}
        />        
        <button onClick={priceConfig} className={styles.button1}>Price Set</button>
        <button onClick={trustyPriceEnable} className={styles.button1}>Price Active : [{JSON.stringify(priceEnabler)}]</button>
        
        {/* <input
          type="number"
          placeholder='deposit eth'
          min={0}
          step="0.01"
          onChange={(e) => setDeposit(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={depositFactory} className={styles.button1}>deposit factory</button> */}

        <hr/>

        <label>FACTORY WHITELIST</label>

        <p><i>(Use this field to add addresses to the Factory's whitelist in order to approve the use of the Trusty Factory service)</i></p>

        <input
          type="text"
          placeholder={`<Address to add to the Trusty Factory's whitelist> example: 0x012345789ABCdef...`}
          value={inputFactoryWhitelistValue}
          onChange={handleFactoryWhitelistChange}
          className={styles.input}
        /><br/><br/>

        <button className={styles.button3} onClick={handleFactoryWhitelistAdd}>update list</button>
        <button className={styles.button2} onClick={clearFactoryWhitelistInput}>clear list</button>        

        {/* <label>Current Whitelist:</label>

        <ul>
          {getFactoryWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul> */}

        <hr/>

        <code>
          <label>[To add]:</label>
          <ul>
          {factoryWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
          </ul>
        </code>

        <button className={styles.button1} onClick={addAddressToFactoryWhitelist}>ADD to Factory Whitelist</button>
        <button className={styles.button1} onClick={removeAddressFromFactoryWhitelist}>REMOVE from Whitelist</button>
        
        <hr/>

        <input
          type="number"
          placeholder={`<Set maximum number of whitelisted addresses> example: 10`}
          min={factoryMaxWhitelist}
          step="1"
          value={factoryMaxWhitelist}
          onChange={(e) => setFactoryMaxWhitelist(e.target.value)}
          className={styles.input}
        /><br/><br/>

        <button className={styles.button1} onClick={setMaxWhitelist}>Set Max Whitelisted</button>

        <code>
          <label>[maxWhitelisted]:</label>
          <code className={styles.col_val}>{maxWhitelisted}</code>
          <br/>
          <label>[addressesWhitelisted]:</label>
          <code className={styles.col_val}>{addressesWhitelisted}</code>
        </code>
      </div>
    )
  };

  return (
    <div>
      <Head>
        <title>Trusty</title>
        <meta name="description" content="Trusty-dApp, a generator-manager for vaults and multisignatures contracts wallets accounts 2/3 or 3/3..."/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.nav}>
        <Link href="/" className={dashboard?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setDashboard(!dashboard)}}>Dashboard</Link>
        <Link href="#create" className={create?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setCreate(!create)}}>Create</Link>
        <Link href="#manage" className={manage?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setManage(!manage)}}>Manage</Link>
        <Link href="#txs" className={TXS?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setTXS(!TXS)}}>Transactions</Link>
        <Link href="#submit" className={submit?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setSubmit(!submit)}}>Submit</Link>
        <Link href="#about" className={about?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setAbout(!about)}}>About</Link>
      </div>
      <div className={styles.main}>        
        <div>

          {network.name !== null &&(<h1 onClick={()=>getFactoryOwner} className={styles.title}>
            <span className={styles.col_dec}>TRUSTY multi-signature Factory</span> on<span className={styles.col_exe}></span>
            <button onClick={(e)=>{switchNetwork()}} className={styles.button3}>{network.name} {network.id}</button>
          </h1>)}

          {!walletConnected && (
            <>
              <button className={styles.button1} onClick={()=>{connectWallet()}}>CONNECT</button>
            </>
          )}

          {about && (
          <div id="about">
            <h2>ABOUT</h2>
            <h3 className={styles.title}>
              A generator and manager for multi-transactions-signatures-wallets <code>2/3</code> or <code>3/3</code>.
            </h3>

            <span>Create your own multi-signature safe and trust vault wallet on the blockchain and manage the execution of transactions with 2+ or 3/3 confirmations</span>

            <Doc/>
            
          </div>
          )}

          {network.name !== null && dashboard && (<>
          <div className={styles.description}>
            <code>
              <span className={styles.col_exe}>{contractsIdsMinted}</span>
            </code> total TRUSTY created
            {/* <button className={styles.button1} onClick={(e)=>increaseV(vNum)}>
              <span>{` v${vNum}: `+FACTORY_ADDRESS+ ` ${version[vNum]}`}</span>
            </button> */}
          </div>

          <div className={styles.description}>
            Wallet: <code><span className={styles.col_dec}><Link href={`https://${network.name}.etherscan.io/address/${account}`} target={`_blank`}>{account}</Link></span></code> <br />
            Balance: <strong><span className={styles.col_val}>{balance}</span></strong> ETH <br />

            {getNetworkState && (
              <>
                Block: <code><span className={styles.col_data}>{block.current}</span></code> <br />
                Gas: <code><span className={styles.col_data}>{gas.current}</span></code> <br />
              </>
            )}
            
            {/* <Api account={account} balance={balance} block={block} price={price} gas={gas} usdBalance={usdBalance}/> */}

            {isOwner && renderAdmin()}
          </div>
          </>)}
          
          {notification != null &&
            <div className={styles.notification}>
              <button onClick={clear}>x</button>
              <code className={styles.col_dec}>[LOG]</code>: <code>{notification}</code>
            </div>
          }

          {/* <Trusty props={}/> */}

          {/* TRUSTIES DETAILS */}
          {dashboard && walletConnected && (
            <div className={styles.description+" " +styles.trustylist}>
              <p>Trusty you own:</p>
              <span><i>(Click and select on the multi-signature address you want to use)</i></span>
              {TRUSTY_ADDRESS.map(item => (
                    <p key={item.id} className={trustyID===item.id?styles.link_active2: styles.button1} onClick={()=>{setTrustyID(item.id)}}>
                      ID: <code>
                        <span className={styles.col_dec}>{item.id}</span>
                      </code> | Address: <span className={styles.col_data}>{item.address}</span>
                    </p>
              ))}
            </div>
          )}

          {/* RENDER CREATE TRUSTY CONFIG */}
          {create && walletConnected && !loading && renderInput()}          

          {/* RENDER CREATE TRUSTY */}
          {create && walletConnected && !loading && renderButton()}

          {/* RENDER MANAGE TRUSTY ACTION */}
          {manage && walletConnected && TRUSTY_ADDRESS.length > 0 && !loading && renderActions()}

          {/* CREATE TRUSTY TX */}
          {submit && walletConnected && TRUSTY_ADDRESS.length > 0 && !loading && renderTrusty()}

          {/* GET TRUSTY TX */}
          {TXS && walletConnected && TRUSTY_ADDRESS.length > 0 && trustyID !== null && renderTx()}

        </div>

      </div>

      <div className={styles.logo}>
        <Image className={styles.image} src="/logo.png" width={350} height={350} alt="img" />
        
        <span>Trusty Factory Address: </span><br/>
        <code className={styles.col_data}>
          <Link target="_blank" href={"https://"+ (network.name==='mainnet'?"":`${network.name}.`)+"etherscan.io/address/"+FACTORY_ADDRESS}>{"https://"+ (network.name==='mainnet'?"":`${network.name}.`)+"etherscan.io/address/"+FACTORY_ADDRESS}</Link>
        </code>
      </div>

      <footer className={styles.footer}>
        <code>
          Copyright &copy; {new Date().getFullYear()} Ramzi Bougammoura <br/>
          Made with &#10084; by <Link href="https://x.com/0xrms_" target="_blank"> 0xrms </Link>
        </code>
      </footer>
    </div>
  );
}

/*
export async function getStaticProps() {
  //const resApi = await fetch(`https://127.0.0.1:3000/api/hello`);
  //const articles = await resApi.json();

  const resBlock = await fetch("https://blockchain.info/latestblock");
  const block = await resBlock.json();
  const resPrice = await fetch("https://api.blockchain.com/v3/exchange/tickers/ETH-USD");
  const price = await resPrice.json();""
  const resGas = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey="+process.env.ETHERSCAN_API_KEY);
  const gas = await resGas.json();
  const resUsdBalance = await fetch("https://api.etherscan.io/api?module=account&action=balance&address=&tag=latest&apikey="+process.env.ETHERSCAN_API_KEY)
  const usdBalance = await resUsdBalance.json();
  return {
    props: {
      // props for your component
      //articles,
      block,
      price,
      gas,
      usdBalance
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 30, // In seconds
  };
}
*/
