import { BigNumber, Contract, providers, utils, ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

import { FACTORY_ADDRESS, FACTORY_ABI, CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

import Trusty from "../components/web3";
import { AbiCoder, base58, parseBytes32String } from "ethers/lib/utils";

//const SHA256 = require('crypto-js/sha256');
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { sha256 } = require("ethereum-cryptography/sha256");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");


export default function Home(props) {
  const [network,setNetwork] = useState({id:5,name:"goerli"});
  const ETHERSCAN_URL = "https://goerli.etherscan.io/tx/";
  const TRUSTY_FACTORY_ADDR = "0xA2bDd8859ac2508A5A6b94038d0482DD216A59A0";
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState(0);
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  const [balanceFactory, setBalanceFactory] = useState(0);
  // contractsIdsMinted keeps track of the number of ContractsIds that have been minted
  const [contractsIdsMinted, setContractsIdsMinted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // This variable is the `0` number in form of a BigNumber
  const zero = BigNumber.from(0);
  /** Variables to keep track of amount */
  // `ethBalance` keeps track of the amount of Eth held by the user's account
  const [ethBalance, setEtherBalance] = useState(zero);
  const [deposit, setDeposit] = useState(zero);
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(zero);
  // ownersToTrusty
  const [ownersToTrusty, setOwnerToTrusty] = useState();
  const [owner1, setOwner1] = useState();
  const [owner2, setOwner2] = useState();
  const [owner3, setOwner3] = useState();
  const [confirms, setConfirms] = useState(2);
  const [constructor, setConstructor] = useState();

  //Trusty Owners
  const [trustyOwners,setTrustyOwners] = useState();

  //Trusty created list & deposit
  const [totalTrusty, setTotalTrusty] = useState(0);
  const [TRUSTY_ADDRESS, setTRUSTY_ADDRESS] = useState([]);
  const [depositTrusty, setDepositTrusty] = useState();
  const [trustyID, setTrustyID] = useState(null);
  const [trustyBalance, setTrustyBalance] = useState(0);
  const [trustyPrice, setTrustyPrice] = useState(0);

  // isOwner? True
  const [imOwner, setImOwner] = useState(false);
  const [ownerOfId, setOwnerOfId] = useState([]);
  let mine = useRef();

  //let array = [];
  let trusties = useRef([]);
  let trustyBox = [];
  const [trustySelected, setTrustySelected] = useState();

  // TX parameter
  const [totalTx, setTotalTx] = useState(0);
  const [TRUSTY_TXS, setTRUSTY_TXS] = useState([]);
  const txBox = [];
  const [txID, setTxID] = useState();
  const [txTo, setTxTo] = useState();
  const [txValue, setTxValue] = useState(zero);
  const [txData, setTxData] = useState();
  const [txEnc, setTxEnc] = useState();

  const [txFirms, setTxFirms] = useState(0);
  const [_txTo, _setTxTo] = useState(0);
  const [_txValue, _setTxValue] = useState(zero);
  const [isEXE, setIsEXE] = useState(false);

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
    setOwnerToTrusty(array);
    console.log(array);
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
      const receipt = await tx.wait();
      setLoading(false);
      notifica("You successfully created a Trusty Wallet... "+JSON.stringify(receipt.hash));
      //notifica.current = "You successfully created a Trusty Wallet ",receipt;
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
      setWalletConnected(true);
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
      //console.log("OWNER:", _owner);

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
        const factoryB = (await provider.getBalance("0xebb477aaabaedd94ca0f5fd4a09aa386a9290394") / 1000000000000000000).toString();
        setBalanceFactory(factoryB);
        //console.log(factoryB);
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

  async function depositFactory() {
    try {
      console.log("admin deposit");
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const tx = await contract.fallback({ value: utils.parseEther(deposit), gasLimit: 300000 });
      //const tx = await contract.
      console.log(tx);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  /**
   * getContractsIdsMinted: gets the number of tokenIds that have been minted
   */
  const getContractsIdsMinted = async (x) => {
    //let i = 0;
    //for (i;i>=0; i++) {

    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner(true);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      // call the tokenIds from the contract
      const _contractAddr = await contract.contracts(x);
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string

      setTRUSTY_ADDRESS(_contractAddr);
      //setTrustyID(x);
      trustyBox.push({ id: x, address: _contractAddr });

      console.log(trustyBox);
      //checkTrustyId(_contractAddr);
      //const _isMine = await contract.imOwner(contractsIdsMinted);

      //console.log(_isMine);
      //setContractsIdsMinted(contractsIdsMinted);

      //if (contract.imOwner(i)) {}
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
      //return;
    }
    //}
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
        //i++;
        const _imOwner = await contract.imOwner(i);
        const _contractAddr = await contract.contracts(i);

        if (_imOwner === true) {
          //console.log(i, _imOwner);
          //array.push(i);
          setTRUSTY_ADDRESS(_contractAddr);
          array.push({ id: i, address: _contractAddr });

          //setTrustySelected([...array, { id: i, address: _contractAddr }]);
          //setTrustySelected(array);
          //console.log(trustySelected);

          //console.log(array);
          //setOwnerOfId(array);

          //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
          setImOwner(true);

          getContractsIdsMinted(i);

          //return
        } else {
          //setImOwner(false);
        }
      }
      renderActions();
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
    }

    //console.log("mine",mine);
  };

  // TRUSTY DETAILS
  async function getDetails() {
    try {
      //console.log("Details", trustyID);
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      let total = await contract.totalTrusty();
      setTotalTrusty(total);
      total = total.toString();
      setContractsIdsMinted(total);
      //const _contractAddr = await contract.contracts(x);
      const price = (await contract._price() / 1000000000000000000).toString().slice(0, 10);
      //console.log("PRICE: ", price);
      setTrustyPrice(price);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // CHECK TRUSTY BALANCE
  async function checkTrustyId() {
    //console.log("Trusty addr", addr);
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    //const _contractAddr = await contract.contracts(x);
    //for (let i = 0; i < totalTrusty; i++) {
    //const address = await contract.contracts(i);
    //getContractsIdsMinted(i);
    //console.log(trustyBox[0]);
    //if (address === TRUSTY_ADDRESS) {
    //console.log("ID: ", i);

    //setTrustyID(i);
    //setTrustySelected(i);
    //getTxTrusty(i);
    //setTRUSTY_ADDRESS(address);
    //trustyBox.push({id:i,address:_contractAddr})
    const balance = (await contract.contractReadBalance(trustyID) / 1000000000000000000).toString();
    setTrustyBalance(balance);
    //} else {
    //setTrustyBalance(0);
    //setTrustyID("");
    //setTRUSTY_ADDRESS("");
    //}
    //}
  }

  // CHEK TRUSTY OWNERS
  async function checkTrustyOwners() {
    //console.log("Trusty ID|ADDR", trustyID, addr);
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    //const _contractAddr = await contract.contracts(x);
    //for (let i = 0; i < totalTrusty; i++) {
    //const address = await contract.contracts(i);
    //getContractsIdsMinted(i);
    //console.log(trustyBox[0]);
    //if (address === TRUSTY_ADDRESS) {
    //console.log("ID: ", i);

    //setTrustyID(i);
    //setTrustySelected(i);
    //getTxTrusty(i);
    //setTRUSTY_ADDRESS(address);
    //trustyBox.push({id:i,address:_contractAddr})
    const owners = (await contract.contractReadOwners(trustyID)).toString();
    setTrustyOwners(owners);
    //console.log("Trusty ID|Owners:",trustyID,owners);
    //} else {
    //setTrustyBalance(0);
    //setTrustyID("");
    //setTRUSTY_ADDRESS("");
    //}
    //}
  }

  // DEPOSIT to TRUSTY
  async function depositToTrusty() {
    try {
      console.log("Starting deposit", trustyID);
      console.log("Amount", addEther);
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
      /*
      // implement keccak256 (sha3)
      const keccak256 = (input: string) => {
        // so easy I leave this as an excercise for the reader
      }

      // get keccak256 hash of the function signature
      const sigHash = keccak256('addX(uint256)') // 0x36d3dc4be.....99d5c143ea94

      // take the first 4 bytes == 8 characters, not including the "0x"
      const firstFourBytes = sigHash.slice(0, 10) // 0x36d3dc4b

      // Each hex character is 4 bits, so 2 characters is byte. Note this
      // calculation is agnostic towards how your js engine is _actually_ 
      // storing the string representation of the hexadecimal.

      // append the hex encoded integer param, padded to 32 bytes, or 64 characters
      const intToHex = (int: number) => int.toString(16)
      const param1 = intToHex(2).padStart(64, 0)
      const input = firstFourBytes + param1

      // 0x36d3dc4b0000000000000000000000000000000000000000000000000000000000000002
      console.log(input) 
      */
      //let tx;
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      //console.log("tx...",trustyID, txTo, utils.parseEther(txValue), convertToHex(txData));
      //console.log(ethers.utils.hexValue([...Buffer.from(txData)]));
      //console.log("method:",ethers.utils.keccak256([...Buffer.from(txData)]).slice(0,10));
      //console.log("encode:",ethers.utils.defaultAbiCoder.encode([...Buffer.from(types)],[...Buffer.from(args)]));
      //console.log("encode:",ethers.utils.defaultAbiCoder.encode(encode(txData)));
      //console.log(toHex(new Uint8Array(txData)));

      let obj = encodeMethod(txData);
      console.log(obj);
      //console.log(obj,new ethers.utils.Interface(CONTRACT_ABI).encodeFunctionData("confirmTransaction",["0"]));
      //console.log(`to:${txTo}, amount:${txValue}, data:${txData}`);

      //0xc01a8c840000000000000000000000000000000000000000000000000000000000000000
      //{value: utils.parseEther(txValue)} | 100000000000000000 | BigNumber.from([utils.parseEther(txValue)])
      //const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), 0);
      console.log(convertToHex(txData));
      const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), obj.hex);
      //const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), [...Buffer.from(convertToHex(obj.hex))]);
      //const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), [...Buffer.from(convertToHex(txData))]);
      //tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), obj.hex);
      //const tx = await contract.trustySubmit(trustyID, txTo, ethers.utils.parseEther(txValue), ethers.utils.defaultAbiCoder.encode([...Buffer.from(obj.types)],[...Buffer.from(obj.args)]));
      //const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), new utils.Interface().encodeFunctionData(txData,obj.args));

      //const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), ethers.utils.hexValue([...Buffer.from(txData)]));
      //const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), ethers.utils.defaultAbiCoder.encode(txData));
      //const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), [...Buffer.from(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(txData)))]);
      //const tx = await contract.trustySubmit(trustyID, txTo, utils.parseEther(txValue), ethers.utils.keccak256([...Buffer.from(txData)]));
      
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      //notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
      //const tx = await contract.trustySubmit(0, "0x277F0FE830e78055b2765Fa99Bfa52af4482E151", 1, 0);
      //0x277F0FE830e78055b2765Fa99Bfa52af4482E151
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
      setLoading(false);
    }

  }

  // UTILS FUNCTION
  function encodeMethod(str) {
    if (str) {
      let obj = {
        method: "",
        types:"",
        args:"",
        hex:""
      }
      let bytes = [];
      let types = "";
      let args = "";
      let hex = "";
      let data = txData;
      let condition = false;

      for (let i=0;i<data.length;i++) {   
        if (!condition) {
          //condition = true;
          types+=data[i];
        } else {
          args+=data[i];
        }
        if (data[i]===")") {
          condition = true;
          //types+=data[i];
        } 
      }

      //console.log(types);
      //console.log(args);
      bytes.push(types);
      bytes.push(args);
      obj.types = types;
      obj.args = args;
      obj.method = ethers.utils.keccak256([...Buffer.from(types)]).slice(0,10);
      obj.hex = `${obj.method}${thirdTopic(obj.args)}`;
      //console.log(bytes);
      //setTxEnc(bytes);
      //web3.eth.abi.encodeFunctionSignature('myMethod(uint256,string)');
      //console.log("method:",ethers.utils.keccak256([...Buffer.from(data)]).slice(0,10));
      //console.log("encode:",ethers.utils.defaultAbiCoder.encode([...Buffer.from(types)],[...Buffer.from(args)]));
      //console.log("encode:",ethers.utils.defaultAbiCoder.encode([...Buffer.from(obj.method)],[...Buffer.from(obj.args)]));
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
      // TODO #2: add the address and left-pad it with zeroes to 32 bytes
      // then return the value
      //const address = "28c6c06298d514db089934071355e5743bf21d60";
      const address = arg;
      return "0".repeat(24) + address; 
    } else {return null}
  }

  function thirdTopic(arg) {
    if (arg) {
      // TODO #2: add the address and left-pad it with zeroes to 32 bytes
      // then return the value
      //const address = "28c6c06298d514db089934071355e5743bf21d60";
      const address = arg;
      return "0".repeat(64-arg.length) + address; 
    } else {return null}
  }

  function pack(arg) {
    //const topics = [firstTopic(), secondTopic()].map((x) => '0x' + x);
    if (arg) {
      return '0x' + secondTopic(firstTopic(arg));
    } else {return null}
  }

  //const topics = [firstTopic(), secondTopic()].map((x) => '0x' + x);

  // GET TX TRUSTY
  async function getTxTrusty() {
    try {
      let box = [];
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      //console.log("x",trustyID);
      const txs = await contract.contractReadTxs(trustyID);
      //console.log("total txs",txs.toString());
      setTotalTx(txs);

      for (let i = 0; i < txs; i++) {
        const gettxs = await contract.getTx(trustyID, i);

        box.push({ id: i, to: gettxs[0], value: gettxs[1] / 1000000000000000000, data: gettxs[2], executed: gettxs[3], confirmations: gettxs[4] });


        //_setTxTo(gettxs[0]);
        //_setTxValue(gettxs[1] / 1000000000000000000);
        //setIsEXE(gettxs[3]);
        //setTxFirms(gettxs[4]);

      }

      setTRUSTY_TXS(box);

    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
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
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function notifica(msg) {
    setNotification(msg.toString());
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
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    // == 5 
    if (chainId !== network.id) {
      notifica(`Change the network from ${chainId} to ${network.id}:${network.name}`);
      //window.alert("Change the network to Goerli");
      //throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      setAccount(await signer.getAddress())
      setOwner1(await signer.getAddress());
      setBalance((await signer.getBalance() / 1000000000000000000).toString().slice(0, 10));

      return signer;
    }
    return web3Provider;
  };

  async function checkAll() {
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

          //getContractsIdsMinted(i);
        }
      }
      setContractsIdsMinted(total.toString());
      setTRUSTY_ADDRESS(box);
      //console.log(TRUSTY_ADDRESS);
      //console.log(box)
      //trustyBox = [...box];
      //trusties.current = trustyBox;
      //setTrustySelected(trustyBox);
      //console.log(trustyBox);

    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();

    } else {
      getProviderOrSigner(true);
      checkAll();
      //getContractsIdsMinted();

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        getProviderOrSigner(true);
        if (trustyID != null) {
          //checkTrustyId();
          //getTxTrusty();
          //checkAll();
        }
        //getFactoryOwner();
        //getTrustyId();
        //checkTrustyId(depositTrusty);

        //getTxTrusty();
        //await getContractsIdsMinted();
      }, 5 * 1000);
    }
  }, [account]);

  useEffect(() => {
    getFactoryOwner();
    getDetails();
    //getTrustyId();
  }, []);

  /*
  useEffect(() => {
    //checkTrustyId(depositTrusty);
    //getTxTrusty();
  }, [trustyID]);
  */
  //useEffect(() => {
    //getTrustyId();
    //checkTrustyId(depositTrusty);
    //checkAll();
    //getAll(web3ModalRef);
  //}, []);

  useEffect(() => {
    try {
      if (trustyID != null) {
        //console.log("getting balance..", trustyID);
        checkTrustyId();
        //console.log("getting txs..", trustyID);
        getTxTrusty();
        //console.log("getting owners..", trustyID);
        checkTrustyOwners();
      } 

    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }, [trustyID]);

  useEffect(() => {
    //setTrustyID(null);
    //setTRUSTY_TXS([]);

    setInterval(async function () {
      //getProviderOrSigner(true);
      if (trustyID != null) {        
        getFactoryOwner();
        getDetails();
        checkAll();
        checkTrustyId();
        getTxTrusty();        
      }
      //getFactoryOwner();
      //getTrustyId();
      //checkTrustyId(depositTrusty);

      //getTxTrusty();
      //await getContractsIdsMinted();
    }, 5 * 1000);
  },[account]);

  // Handle Account change
  useEffect(()=>{
    setTrustyID(null);
    setTRUSTY_TXS([]);
    /*
    getDetails();
    checkAll();
    checkTrustyId();
    getTxTrusty();   
    */
    //const ethereum = getProviderOrSigner(true);
    //ethereum.on('chainChanged', handleChainChanged);

    // Reload the page when they change networks
    //if(account!=account){handleChainChanged()}
    //handleChainChanged()
  },[account]);

  function handleChainChanged(_chainId) {
    window.location.reload();
  }
  

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
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
        <div className={styles.inputDiv}>

          <legend>Configure your Trusty:</legend>
          <label>Owner 1(You):</label>
          <input
            type="text"
            placeholder={owner1}
            //onChange={(e) => setOwner1(e.target.value || "0")}
            //value={owner1}
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
          <br />
          <label>Min Confirmation:</label>
          <input
            type="number"
            placeholder="2"
            min="2"
            max="3"
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
      <div className={styles.inputDiv}>
        <legend>Manage your Trusty</legend>
        <label>Trusty:</label>

        {renderOptions()}

        <p>Trusty Balance: {trustyBalance}</p> <br />
        <p>Trusty ID: {trustyID}</p> <br />

        <label>ETHEREUM amount:</label>
        <input
          type="number"
          placeholder="Amount of Ether"
          step="0.01"
          onChange={(e) => setAddEther(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={depositToTrusty} className={styles.button}>Deposit</button>

      </div>)
  };

  // SELECT the TRUSTY
  const renderOptions = () => {

    return (
      <div>
        <select
          //onInput={checkTrustyId(depositTrusty.value)}
          onChange={(e) => {setTrustyID(e.target.value || null);}}
          className={styles.select}
        >
          <option value="">--Select Trusty address--</option>

          {TRUSTY_ADDRESS.map(item => (
            <option key={item.id} value={item.id}>{item.id} | {item.address}</option>
          ))}
        </select>

        {trustyOwners != null && 
          <code>Trusty Owners: <span>{trustyOwners}</span></code>
        }

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
      <div className={styles.inputDiv}>
        <legend>Trusty TX:</legend>
        {/* <label>Trusty Address:</label>
        <input
          type="text"
          placeholder='to'
          //onChange={(e) => setOwner1(e.target.value || "0")}
          //value={TRUSTY_ADDRESS[trustyID].address}
          className={styles.input}
          disabled
        /><br /> */}

        <label>to:</label>
        <input
          type="text"
          placeholder='to'
          onChange={(e) => setTxTo(e.target.value || "0x0")}
          className={styles.input}
        />
        <label>Value:</label>
        <input
          type="number"
          placeholder='eth value'
          step="0.01"
          onChange={(e) => setTxValue(e.target.value || "0")}
          className={styles.input}
        />
        <label>Data:</label>
        <input
          type="text"
          placeholder='data 0x00'
          value={txData}
          onChange={(e) => setTxData(e.target.value || "0")}
          className={styles.input}

        /><br />
        <div className={styles.inputDiv}>
          <p>to: {txTo}</p>
          <p>value: {txValue.toString()} ETH</p>
          <p>data: {txData} </p>
          
          <button onClick={submitTxTrusty} className={styles.button}>Submit</button>

          <div className={styles.description}>
            <code>data bytes|binary|hexadecimal serialization
              <p>[data]: |{txData}|</p>
              <p>[Encoding]: |{txEnc}|</p>
              <p>[test]: |{new ethers.utils.Interface(CONTRACT_ABI).encodeFunctionData("confirmTransaction",["0"])}|</p>
              <p>unpack: |{unpack(txData)}|</p>
              <p>string2Bin: |{string2Bin(txData)}|</p>
              <p>convertToHex: |{convertToHex(txData)}|</p>
              <p>bytes2hash2hex: |{firstTopic(txData)}|</p>
              <p>padding: |{secondTopic(txData)}|</p>
              <p>pack: |{pack(txData)}|</p>
              <p>string2hex: |{hex2string(txData)}|</p>

              {/* <p>keccak256: |{ethers.utils.keccak256(ethers.utils.toUtf8Bytes(txData))}|</p> */}
              {/* <p>defaultAbiCoder: |{ethers.utils.defaultAbiCoder.encode([...Buffer.from(txData)])}|</p> */}
              {/* <p>hexValue: |{ethers.utils.hexValue(txData)}|</p> */}
              {/* 
              <p>sha256: |{sha256(convertToHex(txData))}|</p>

              <p>base58: |{utils.base58.encode(utils.parseBytes32String(Buffer.from(utils.keccak256(txData))))}|</p>
              <p>base64: |{utils.base64.encode(txData)}|</p>
              <p>keccak256: |{utils.keccak256(txData)}|</p>
              <p>ripemd160: |{utils.ripemd160(txData)}|</p>
              <p>SHA256: |{utils.sha256(txData)}|</p>
              <p>SHA512: |{utils.sha512(txData)}|</p>

              <p>message_hash: |{utils.hashMessage(txData)}|</p>
              */}
            </code>
          </div>
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

        {/* {JSON.stringify(TRUSTY_TXS)}  */}

        <div className={styles.txs}>

          {TRUSTY_TXS.map(item => (
            <div key={item.id} className={styles.tx}>
              <p>id: {item.id}</p>
              <p>To: {item.to.toString()}</p>
              <p>Value: {item.value.toString()} ETH</p>
              <p>Data: {item.data.toString()}</p>
              <p>Decode Data: {hex2string(item.data)}</p>
              <p>Executed: <code>{item.executed.toString()}</code></p>
              <p>Confirmations: {item.confirmations.toString()}</p>
              {!item.executed == true && (<div>

                <button onClick={() => { confirmTxTrusty(item.id) }} className={styles.button1}>confirm</button>
                <button onClick={() => { revokeTxTrusty(item.id) }} className={styles.button2}>revoke</button>
                <button onClick={() => { executeTxTrusty(item.id) }} className={styles.button3}>execute</button>

              </div>)}

            </div>
          ))}

        </div>

        {/* TX id: <br />
        To: {_txTo.toString()}<br />
        Amount: {_txValue.toString()} <br />
        Executed: {isEXE.toString()} <br />
        Confirmations: {txFirms.toString()} <br />
        <button className={styles.button1}>confirm</button>
        <button className={styles.button1}>revoke</button>
        <button className={styles.button}>execute</button> */}
      </div>
    )
  };

  // FACTORY ADMIN
  const renderAdmin = () => {
    return (
      <div className={styles.inputDiv}>
        Trusty Factory Balance {balanceFactory} ETH
        <button onClick={withdraw} className={styles.button}>withdraw</button>
        <br />
        <input
          type="number"
          placeholder='deposit eth'
          step="0.01"
          onChange={(e) => setDeposit(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={depositFactory} className={styles.button}>deposit factory</button>
      </div>
    )
  };

  const renderTxBtn = (x, y) => { };

  return (
    <div>
      <Head>
        <title>Trusty RMS</title>
        <meta name="description" content="Trusty-Dapp, a generator-manager for vault and multi-signature accounts wallets 2/3 or 3/3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        
        <div>
          <h1 onClick={getFactoryOwner} className={styles.title}>Welcome to TRUSTY RMS on {network.name}:{network.id}!</h1>
          
          <h3 className={styles.title}>
            Create your own safe vault on the blockchain and manage the execution of transactions with 2+ or 3/3 confirmations
          </h3>
          <span>A generator and manager for multi-transactions-signatures-wallets <code>2/3</code> or <code>3/3</code>.</span>
          <div className={styles.description}>
            <code>{contractsIdsMinted}</code> total Trustys have been created
          </div>
          <div className={styles.description}>
            Wallet: <code>{account}</code> <br />
            Balance: <strong>{balance}</strong> ETH <br />
            {isOwner && renderAdmin()}
          </div>

          {notification != null &&
            <div className={styles.notification}>
              <button onClick={clear}>x</button>
              Log: {notification}
            </div>
          }

          {/* <Trusty props={}/> */}

          {/* RENDER CREATE TRUSTY CONFIG */}
          {walletConnected && !loading && renderInput()}

          {/* RENDER CREATE TRUSTY */}
          {walletConnected && !loading && renderButton()}

          {/* TRUSTIES DETAILS */}
          {walletConnected && (
            <div className={styles.description}>
              <p>Trustys you own:</p>
              {TRUSTY_ADDRESS.map(item => (
                <p key={item.id}>ID: <code>{item.id}</code> | Address: {item.address}</p>
              ))}
            </div>
          )}

          {/* RENDER MANAGE TRUSTY ACTION */}
          {TRUSTY_ADDRESS.length > 0 && !loading && renderActions()}

          {/* CREATE TRUSTY TX */}
          {TRUSTY_ADDRESS.length > 0 && !loading && renderTrusty()}

          {/* GET TRUSTY TX */}
          {TRUSTY_ADDRESS.length > 0 && trustyID !== null && renderTx()}

        </div>

      </div>

      <div className={styles.logo}>
        <Image className={styles.image} src="/logo.png" width={350} height={350} alt="img" />
        <p>Trusty Factory Address: <Link target="_blank" href={"https://goerli.etherscan.io/address/"+TRUSTY_FACTORY_ADDR}>{"https://goerli.etherscan.io/address/"+TRUSTY_FACTORY_ADDR}</Link></p>
      </div>

      <div>
        
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by 0xrms
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  // Get external data from the file system, API, DB, etc.
  const data = ["ciao", "sono", "data"]
  //const ethereum = window;

  //const connection = ethers.connect()
  //const provider = new ethers.providers.Web3Provider(connection)
  //const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
  //console.log(ethers);


  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: { data }
  }
}