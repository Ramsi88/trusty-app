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
import { /* CONTRACT_ABI, */ CONTRACT_SIMPLE_ABI, CONTRACT_ADVANCED_ABI, RECOVERY_ABI } from "../constants";
const CONTRACT_ABI = CONTRACT_SIMPLE_ABI
import styles from "../styles/Home.module.css";

const { keccak256 } = require("ethereum-cryptography/keccak");

const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

import Doc from "../components/doc";
import Api from "../components/api";

const ethDecimals = 10**18;

const getNetworkState = false;

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
    sepolia:[
      {
        symbol: "USDC",
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        decimals: 6
      },
      {
        symbol: "WETH",
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        decimals: 18
      },    
      {
        symbol: "LINK",
        address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        decimals: 18
      },
      {
        symbol: "UNI",
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        decimals: 18
      }
    ],
    goerli: [
      {
        symbol: "WETH",
        address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        decimals: 18
      },
      {
        symbol: "LINK",
        address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        decimals: 18
      },
      {
        symbol: "LP",
        address: "0x2D09205871aC539e14Fd5b2Db9c7d00DaD4A1386",
        decimals: 18
      },
      {
        symbol: "MTK",
        address: "0x14cF758d08A1F1Cf7797348231bb71a69D8944f4",
        decimals: 18
      },
    ],
    mumbai: [
      {
        symbol: "USDC",
        address: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
        decimals: 6
      },
      {
        symbol: "WMATIC",
        address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        decimals: 18
      },
      {
        symbol: "WETH",
        address: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
        decimals: 18
      },
      {
        symbol: "LINK",
        address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        decimals: 18
      }
    ],
    polygon: [
      
    ]
}

const actions = [
  {type: "ERC20", calldata: "approve(address,uint256)", description: "Approves and authorize sending to an ADDRESS an AMOUNT"},
  {type: "ERC20", calldata: "transfer(address,uint256)", description: "Transfer to an ADDRESS an AMOUNT"},
  {type: "TrustySimple", calldata: "submitTransaction(address,uint256,bytes)", description: "Use this to submit a transaction to a Trusty without EOA owners"},
  {type: "TrustyAdvanced", calldata: "submitTransaction(address,uint256,bytes,uint256)", description: "Use this to submit a transaction to a Trusty without EOA owners"},
  {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to confirm a transaction when you have more than a Trusty linked"},
  {type: "Trusty", calldata: "executeTransaction(uint256)", description: "Use this to execute a transaction when you have more than a Trusty linked"},
  {type: "Recovery", calldata: "recover()", description: "Use this to execute an ETH Recover of a Trusty in Recovery mode"},
  {type: "Recovery", calldata: "recoverERC20(address)", description: "Use this to execute an ERC20 Recover of a Trusty in Recovery mode"},
  {type: "Recovery", calldata: "POR()", description: "Use this to execute a Proof Of Reserve and unlock the Absolute Timelock of a Trusty in Recovery mode"}
]


export default function Single() {
    const [network,setNetwork] = useState({});
    const networks = {
      //mainnet : {id: 1, name: "Ethereum Mainnet", contract:""},
      goerli: {id: 5, name: "Goerli", contract:""},
      sepolia: {id: 11155111, name: "Sepolia", contract:""},
      //polygon: {id: 137, name: "Polygon", contract:""},
      mumbai: {id: 80001, name: "Mumbai", contract:""},
      //amoy: {id: 80002, name: "Amoy", contract: ""},
      //base: {id: 8453, name: "Base", contract:""},
      //optimism: {id: 10, name: "Optimism", contract:""},
      //arbitrum: {id: 42161, name: "Arbitrum", contract:""},
    }
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);
    
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);

    const [loading, setLoading] = useState(false);

    const [inputTrustyValue,setInputTrustyValue] = useState("");
    const [CONTRACT_ADDRESS,setCONTRACT_ADDRESS] = useState("");
    const [isRecovery, setIsRecovery] = useState(false)
    const [trustyConnected, setTrustyConnected] = useState(false);
    const [id, setId] = useState("");
    const [owners, setOwners] = useState([]);

    const [trustyBalance, setTrustyBalance] = useState(0)
    
    const [minConfirmation, setMinConfirmation] = useState(0);

    const [whitelist, setWhitelist] = useState([]);    
    const [blacklist, setBlacklist] = useState([]);

    const [absoluteTimelock, setAbsoluteTimelock] = useState(0);
    const [recoveryTrusty, setRecoveryTrusty] = useState("");

    const zero = BigNumber.from(0);  

    // addEther is the amount of Ether that the user wants to add to the liquidity
    const [addEther, setAddEther] = useState(zero);

    const [inputTrustyWhitelistValue, setInputTrustyWhitelistValue] = useState('');
    const [trustyWhitelist, setTrustyWhitelist] = useState([]);
    const [inputTrustyBlacklistValue, setInputTrustyBlacklistValue] = useState('');
    const [trustyBlacklist, setTrustyBlacklist] = useState([]);

    const trustyTokens = useRef([])

    const [totalTx, setTotalTx] = useState(0)
    const [transactions, setTransactions] = useState([]);
    const [toggleExecuted, setToggleExecuted] = useState(false);

    // TX parameter
    const [txTo, setTxTo] = useState("");
    const [txValue, setTxValue] = useState("0");
    const [txData, setTxData] = useState("0");
    const [selector, setSelector] = useState("");
    const [paramtype1,setParamType1] = useState("");
    const [paramtype2,setParamType2] = useState("");
    const [isCallToContract,setIsCallToContract] = useState(false);
    const [advanced, setAdvanced] = useState(false);
    const [isSimple,setIsSimple] = useState(false)
    const [type,setType] = useState("simple")
    const [isTypeSimple,setIsTypeSimple] = useState(false)
    const [isTypeAdvanced,setIsTypeAdvanced] = useState(false)
    const [isTypeRecovery,setIsTypeRecovery] = useState(false)

    //TIME_LOCK
    const [timeLock,setTimeLock] = useState(0);
    const [toggleTimeLock,setToggleTimeLock] = useState(false);

    //Notifications
    let [notification, setNotification] = useState();

    /**
     * connectWallet: Connects the MetaMask wallet
     */
    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner(true);
        } catch (err) {
            console.error(err);
        }
    };

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
        setWalletConnected(true);
        
        for (let i of Object.keys(networks)) {
            let id = networks[i]
            if (id.id === chainId) {
                //setWalletConnected(true);
                setNetwork({id:chainId,name:id.name,contract:id.contract}) //{id:5,name:"goerli",contract:""}
                //notifica(`[NETWORK]: Connected to Trusty Factory on ${id.id} : ${id.name} - ${id.contract}`)
                break
            } else {
                //notifica(`[NETWORK]: No available Trusty Factory contract, please switch the network to find an available one... (${Object.keys(networks)})`)
            }
        }
        
        if (needSigner) {
        const signer = web3Provider.getSigner();
        
        setAccount(await signer.getAddress())
        
        setBalance((await signer.getBalance() / ethDecimals).toString().slice(0, 10));
        
        return signer;
        }
        
        return web3Provider;
    };

    const connectToTrusty = async () => {
        if (!walletConnected) {
          console.log(`[ERROR]walletConnected: ${err}`)
          return
        }
        if(!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
            notifica(`[Address] ${CONTRACT_ADDRESS} is not valid!`)
            setTrustyConnected(false)
            return
        }
        try {
          const signer = await getProviderOrSigner(true);
          const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          let isOwner
          
          isOwner = await contract.isOwner(account);

          if (isOwner) {
            setTrustyConnected(isOwner)
          } else {
            setTrustyConnected(isOwner)
          }

          const id = await contract.id()
          setId(id)

          const trustyOwners = await contract.getOwners()             
          setOwners(trustyOwners)

          const genericErc20Abi = require('constants/erc20.json');

          const getTokens = [];
          if(tokens[network.name.toLowerCase()]){
            tokens[network.name.toLowerCase()].forEach(async (token) => {
              const trustyAddr = CONTRACT_ADDRESS
              const tokenContractAddress = token.address;
              const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer);
        
              const balance = (await contract.balanceOf(trustyAddr)).toString();
              //console.log(`(${token.symbol}): ${balance}`)

              const decimals =  tokens[network.name.toLowerCase()]?.find((el)=>{if(el.address == tokenContractAddress){return el.decimals}})?.decimals || 0
        
              getTokens.push(`(${token.symbol}): ${balance / 10**decimals}`)
            });
          }
          
          trustyTokens.current = getTokens;
          
          const balance = await contract.getBalance() / ethDecimals
          setTrustyBalance(balance)

          const numConfirmationsRequired = parseInt(await contract.numConfirmationsRequired())
          setMinConfirmation(numConfirmationsRequired)

          const totalTXS = (parseInt(await contract.getTransactionCount()))
          setTotalTx(totalTXS)
          let txs = []
          for (let i=0;i<totalTXS;i++) {
            const tx = await contract.getTransaction(i)
            txs.push(tx)
            console.log(tx)
          }
          setTransactions(txs)
          
          if (isTypeAdvanced) {
            try {
              const absoluteLock = parseInt(await contract.absolute_timelock())
              setAbsoluteTimelock(absoluteLock)
            } catch (error) {
              console.log(error)
            }          
            try {
              const whitelisted = await contract.getWhitelist()
              setWhitelist([...whitelisted])
            } catch (error) {
              console.log(error)
            }
            
            try {
              const recover = await contract.recoveryTrusty()
              setRecoveryTrusty(recover)
            } catch (error) {
              console.log(error)
            }
            
            try {
              const blacklisted = await contract.getBlacklist()
              setBlacklist(blacklisted)
            } catch (error) {
              console.log(error)
            }
          } 
        } catch (err) {
          console.log(err.message);
          notifica(err.message.toString());
        }
    }

    // Network
    // TrustyContract ? -> imOwner ?
    // DEPOSIT to TRUSTY
    async function depositToTrusty() {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        //const _contractAddr = await contract.depositContract(trustyID, utils.parseEther(addEther), { value: utils.parseEther(addEther), gasLimit: 300000 });
        //await signer.call({ to:CONTRACT_ADDRESS , value: utils.parseEther(addEther), gasLimit: 300000 })();
        setLoading(true);
        // wait for the transaction to get mined
        //await _contractAddr.wait();
        setLoading(false);
        connectToTrusty()
        */
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    // submitTransaction
    // SUBMIT TX to Trusty
    async function submitTxTrusty() {
      if (CONTRACT_ADDRESS == null) {
        notifica(`You must select a Trusty from which you will send the transaction proposal, selected: [${CONTRACT_ADDRESS}]`)
        return;
      }
      if (!ethers.utils.isAddress(txTo)) {
        notifica(`You must insert a valid address: [${txTo}]`)
        return;
      }
      try {
        const signer = await getProviderOrSigner(true);
        if (isTypeSimple) {
          //contract = new Contract(CONTRACT_ADDRESS, CONTRACT_SIMPLE_ABI, signer);
        }
        if (isTypeAdvanced) {
          //contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ADVANCED_ABI, signer);
        }
        if (isTypeRecovery) {
          //contract = new Contract(CONTRACT_ADDRESS, CONTRACT_RECOVERY_ABI, signer);
        }        
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        if(isCallToContract) {
          let obj = encodeMethod(txData);
          //let submitTransactionApprove = "0x0d59b5640000000000000000000000000fa8781a83e46826621b3bc094ea2a0212e71b230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000dfc860f2c68eb0c245a7485c1c0c6e7e9a759b58000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000000000000"
          //let submitTransactionTransfer = "0x0d59b5640000000000000000000000000fa8781a83e46826621b3bc094ea2a0212e71b230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000dfc860f2c68eb0c245a7485c1c0c6e7e9a759b58000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000000000000"
          let tx
          if (isTypeAdvanced) {
            tx = await contract.submitTransaction(txTo, ethers.utils.parseEther(txValue), obj.hex, timeLock);
          } else {
            tx = await contract.submitTransaction(txTo, ethers.utils.parseEther(txValue), obj.hex);
          }
          setLoading(true);
          // wait for the transaction to get mined
          await tx.wait();
          setLoading(false);
          clearTxParameter();
          connectToTrusty()
          notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
        } else {
          let tx;
          if (isTypeAdvanced) {
            tx = await contract.submitTransaction(txTo, utils.parseEther(txValue), ethers.utils.hexValue([...Buffer.from(txData)]), timeLock);
          } else {
            tx = await contract.submitTransaction(txTo, utils.parseEther(txValue), ethers.utils.hexValue([...Buffer.from(txData)]));
          } 
          setLoading(true);
          // wait for the transaction to get mined
          await tx.wait();
          setLoading(false);
          connectToTrusty()
          notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
        }
      } catch (err) {
        setLoading(false);
        console.log(err?.message);
        notifica(err?.message.toString());
        setLoading(false);
      }
    }
    // confirmTransaction
    // revokeConfirmation
    // executeTransaction
    // CONFIRM TX
    const confirmTxTrusty = async (id) => {
      try {        
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const txs = await contract.confirmTransaction(id);
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        connectToTrusty()
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
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const txs = await contract.revokeConfirmation(id);
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        connectToTrusty()
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
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const txs = await contract.executeTransaction(id, { gasLimit: 300000 });
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        connectToTrusty()
        notifica(`You succesfully executed the Trusty tx id ${id}... ${txs.hash}`);
      } catch (err) {
        setLoading(false);
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    const addToRecoveryWhitelist = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(CONTRACT_ADDRESS, RECOVERY_ABI, signer);
        const addToTrusty = await contract.addAddressToRecoveryWhitelist(trustyWhitelist);
        setLoading(true);
        // wait for the transaction to get mined
        await addToTrusty.wait();
        setLoading(false);
        connectToTrusty()
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    // addAddressToBlacklist
    const addToTrustyBlacklist = async () => {
      try {
        
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const addToTrusty = await contract.addAddressToBlacklist(trustyBlacklist);
        setLoading(true);
        // wait for the transaction to get mined
        await addToTrusty.wait();
        setLoading(false);
        connectToTrusty()
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }
    
    // getOwners
    // getBalance
    // getTransactionCount
    // getTransaction
    // getWhitelist
    // getBlacklist

    // recover
    // recoverERC20

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

        for(let i=0;i<obj.arg.length;i++) {
          // 0 >>>>> string bytes
          if (isNaN(obj.arg[i])) {
            obj.hexn++;
            let edited = `${convertToHex(obj.arg[i])}`
            console.log("edited",edited + "0".repeat(64-edited.length))
            obj.hex+=edited + "0".repeat(64-edited.length)
          }
          // 1 >>>>> array
          if (obj.arg[i].includes(",")) {
            //console.log(">>>array to serialize",obj.arg[i]);
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
          }
          // 3 >>>>> bytes calldata
          if(obj.arg[i].length > 42 && obj.arg[i].startsWith('0x')) {
            obj.hexn++;
            const loc = ((obj.hexn+1)*32).toString(16)
            const calldata = obj.arg[i].slice(2)
            const calldataLen = (calldata.length/2).toString(16)
            //console.log(`[loc]: \n${"0".repeat(64-loc.length)+loc} | [len]: \n${"0".repeat(64-calldataLen.length)+calldataLen}`)
            
            obj.hex+=`${"0".repeat(64-loc.length)+loc}`
            obj.hex+=`${"0".repeat(64)}` //
            obj.hex+=`${"0".repeat(64-calldataLen.length)+calldataLen}`
            obj.hex+=`${thirdTopic(obj.arg[i])}`;
          };
          // 4 >>>>> number array
          if(obj.arg[i].length > 0 ) {
            obj.hexn++;
            obj.hex+=`${thirdTopic(obj.arg[i])}`;
          };
        }
        return obj;
      }
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
        else if (arg.startsWith("0x") && arg.length === 42) {
          arg=arg.slice(2);
          const topic = arg;
          return "0".repeat(64-arg.length)+topic;      
        }
        // is type BYTES calldata
        else if (arg.startsWith("0x") && arg.length > 42) {
          //console.log(">>>")
          arg=arg.slice(2)
          const topic = arg;
          const topicLen = (arg.length/2).toString(16)
          //console.log(`[len](${topicLen}): ${topic}`)
          //console.log(topic)
          return topic
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
  
    function encodeCalldata() {
      try {    
        const decimals =  tokens[network.name.toLowerCase()]?.find((el)=>{if(el.address == txTo){return el.decimals}})?.decimals || 0
  
        let newAmount;
  
        if (paramtype2.includes(".")) {
          let unit = paramtype2.split(".")
  
          if (unit[1].length>decimals) {
            console.log(`Too many decimals ${decimals-unit[1].length}`)
            return
          } else {
            unit[0] = unit[0] //parseInt(unit[0]).toString()
            unit[1] = unit[1] //parseInt(unit[1]).toString()
          }
          
          if (unit[0] === "0") {          
            if (unit[1].length < decimals) {
              newAmount = parseInt(unit[1]).toString() + "0".repeat(decimals-(unit[1].length))
            } else {
              newAmount = parseInt(unit[1]).toString()
            }          
          } else {
            newAmount = unit[0] + unit[1] + "0".repeat(decimals-unit[1].length)
          }
        } else {
          newAmount = paramtype2.toString() + "0".repeat(decimals);
        }
        setTxData(selector+paramtype1+","+ newAmount)
      } catch(err) {
        console.log(`[ERROR] unable to encode: ${err}`)
      }
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

    async function notifica(msg) {
        setNotification(msg.toString());
        setTimeout(()=>{clear()},15000);
    }

    function clearTxParameter() {
      setTxTo("");
      setTxValue("0");
      setTxData("0");
      setSelector("");
      setParamType1("");
      setParamType2("");
    }

    function clear() {
        setNotification(null);
    }    

    useEffect(() => {
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
            // set an interval to get the number of Trusty Ids minted every 15 seconds
            setInterval(async () => {
              getProviderOrSigner(true);
            }, 15 * 1000);
          }
        } catch(err) {
          console.log("[ERROR]:",err)
          notifica(err.message.toString());
        }
    }, [account]);

    // Handle Account change
    useEffect(()=>{
      //const ethereum = getProviderOrSigner(true);
      //ethereum.on('chainChanged', handleChainChanged);

      // Reload the page when they change networks
      if(account!=account){handleChainChanged()}

    },[account]);

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

    useEffect(() => {
      if (!walletConnected) {
        web3ModalRef.current.connect();
      }
      if (walletConnected && trustyConnected) {
        connectToTrusty()
        //getOwners()
      }      
    }
    ,[
      CONTRACT_ADDRESS
    ]
    )

    /*
    useEffect(()=>{
      if(CONTRACT_ADDRESS !== "") {
        setInterval(async()=>{
          connectToTrusty()
        },5000)
      }      
    },[CONTRACT_ADDRESS])
    */

    const handleTrustyWhitelistChange = (e) => {setInputTrustyWhitelistValue(e.target.value)}

    const handleTrustyWhitelistAdd = (e) => {
      if(inputTrustyWhitelistValue !== "" && ethers.utils.isAddress(inputTrustyWhitelistValue) && inputTrustyWhitelistValue !== "0x0000000000000000000000000000000000000000") {
        e.preventDefault();
        setTrustyWhitelist([...trustyWhitelist, inputTrustyWhitelistValue]);
        setInputTrustyWhitelistValue("");
      } else {notifica(`You must specify a valid address to  whitelist!`)}
    }

    const clearTrustyWhitelistInput = () => {
      setTrustyWhitelist([]);
      setInputTrustyWhitelistValue("");
      console.log(`clearing whitelist ... [Trusty Whitelist]`,trustyWhitelist);
    }

    const handleTrustyBlacklistChange = (e) => {setInputTrustyBlacklistValue(e.target.value)}

    const handleTrustyBlacklistAdd = (e) => {
      if(inputTrustyBlacklistValue !== "" && ethers.utils.isAddress(inputTrustyBlacklistValue)) {
        e.preventDefault();
        setTrustyBlacklist([...trustyBlacklist, inputTrustyBlacklistValue]);
        setInputTrustyBlacklistValue("");
      } else {notifica(`You must specify a valid address to be blacklisted!`)}
    }

    const clearTrustyBlacklistInput = () => {
      setTrustyBlacklist([]);
      setInputTrustyBlacklistValue("");
      console.log(`clearing blacklist ... [Trusty Blacklist]`,trustyBlacklist);
    }

    // Network
    function handleChainChanged(_chainId) {
      window.location.reload();
    }

    const renderTrusty = () => {
        return(
            <>
                {walletConnected && 
                  <>
                    <label>Insert the Trusty or Recovery address you want to connect to:</label>
                    <input
                        type="text"
                        placeholder='<address> example: 0xABCDEF0123456abcdef...'
                        value={CONTRACT_ADDRESS}
                        onChange={(e) => setCONTRACT_ADDRESS(e.target.value)}
                        className={styles.input}
                    />
                    <label>
                      <i>Type Advanced</i>
                       [<code className={styles.col_exe}>
                        {JSON.stringify(isTypeAdvanced)}
                        </code>]
                        <input type="checkbox" onChange={()=>setIsTypeAdvanced(!isTypeAdvanced)} checked={isTypeAdvanced}/>
                    </label><br/>
                    {/* <label><b>TrustySimple?</b> [<code className={styles.col_exe}>{JSON.stringify(isSimple)}</code>]</label>
                    <input type="checkbox" onChange={(e)=>setIsSimple(!isSimple)} checked={isSimple}/><br/> */}
                    <button className={styles.button} onClick={connectToTrusty}>Connect to Trusty [{JSON.stringify(trustyConnected)}]</button>
                  </>
                }

                {walletConnected && trustyConnected &&
                <div className={styles.inputDiv}>
                  <h2>Trusty address: {CONTRACT_ADDRESS}</h2>
                  
                  <h3>ID: {id}</h3>

                  <code>Owners:</code>
                  <ul>
                    {owners.length > 0 && owners.map((item,i) => {
                      return (<li key={i}>[{i}] : {item}</li>)
                    })}
                  </ul>
                  <br/>
                  <code>Threshold: {minConfirmation}</code>
                  <br/>
                  {isTypeAdvanced && (<code>Absolute Timelock: {absoluteTimelock}</code>)}
                  <br/>
                  {isTypeAdvanced && (<code>Recovery: {recoveryTrusty}</code>)}
                  <br/>
                  <code>Balance: {JSON.stringify(trustyBalance)} ETH</code>
                  {trustyTokens.current != [] && trustyTokens.current.map((token,i)=>{
                    return <p key={i}><code className={styles.col_dec} key={token}>{token}</code></p>
                  })}
                  <br/>
                  {isTypeAdvanced && (<>
                  <code>Whitelist:</code>
                  <ul>
                    {whitelist.length > 0 && whitelist.map((item,i) => {
                      return (<li key={i}>[{i}] : {item}</li>)
                    })}
                  </ul>
                  
                  <br/>
                  <code>Blacklist: {JSON.stringify(blacklist)}</code>
                  <ul>
                    {blacklist.length > 0 && blacklist.map((item,i) => {
                      return (<li key={i}>[{i}] : {item}</li>)
                    })}
                  </ul>                  
                  <hr/>
                  </>)}
                </div>
                }

                {trustyConnected && isTypeAdvanced && renderManageTrusty()}
                {trustyConnected && renderCreateTx()}
                {trustyConnected && renderTrustyTx()}
            </>
        )
    }

    const renderManageTrusty = () => {
      return(
        <div className={styles.inputDiv}>
          <h2>MANAGE</h2>
          <label><i>WHITELIST</i> [<code className={styles.col_exe}>{JSON.stringify(isRecovery)}</code>]<input type="checkbox" onChange={()=>setIsRecovery(!isRecovery)} checked={isRecovery}/></label><br/>
          {/* <label>ETHER amount to deposit:</label>
          <input
            type="number"
            placeholder="<Amount of Ether> example: 0.10"
            min={0}
            step="0.01"
            onChange={(e) => setAddEther(e.target.value || "0")}
            className={styles.input}
          />
          <button onClick={depositToTrusty} className={styles.button}>Deposit to Trusty {id}</button> */}

          <hr/>

          <label>Blacklist</label>

          <input
            type="text"
            placeholder={`<Address to blacklist> example: 0x0123456789ABCdef...`}
            value={inputTrustyBlacklistValue}
            onChange={handleTrustyBlacklistChange}
            className={styles.input}
          /><br/>
          <button className={styles.button3} onClick={handleTrustyBlacklistAdd}>update list</button>
          <button className={styles.button2} onClick={clearTrustyBlacklistInput}>clear list</button>  
          <hr/>

          <code>
            <label>[Addresses to blacklist]:</label>
            <ul>
            {trustyBlacklist.map((item,i) => {
              return (<li key={i}>[{i}] : {item}</li>)
            })}
            </ul>
          </code>

          <button className={styles.button} onClick={addToTrustyBlacklist}>BLACKLIST</button>

          <ul>
            {blacklist.map((item,i) => {
              return (<li key={i}>[{i}] : {item}</li>)
            })}
          </ul>

          {isRecovery && (
            <>
              <h3>Whitelist Panel</h3>
              <input
                type="text"
                placeholder={`<Address to whitelist> example: 0x0123456789ABCdef...`}
                value={inputTrustyWhitelistValue}
                onChange={handleTrustyWhitelistChange}
                className={styles.input}
              /><br/>

              <code>
                <label>[Update list]:</label>
                <ul>
                  {trustyWhitelist.map((item,i) => {
                    return (<li key={i}>[{i}] : {item}</li>)
                  })}
                </ul>
              </code>
              <button className={styles.button3} onClick={handleTrustyWhitelistAdd}>update list</button>
              <button className={styles.button2} onClick={clearTrustyWhitelistInput}>clear list</button>
              <button className={styles.button} onClick={addToRecoveryWhitelist}>WHITELIST</button>
            </>
          )}
        </div>
      )
    }

    // CREATE TRUSTY TX
    const renderCreateTx = () => {
      return (
        <div id="submit" className={styles.inputDiv}>
          <legend><h3>Submit a Trusty transaction proposal</h3></legend><br/>
          <hr/>
          <label>TX To (Receiver Address or Contract to interact):</label><br/>

          {isCallToContract?
          <>
            <select className={styles.select} onChange={(e) => {setTxTo(e.target.value || "0x0");setTxValue(txValue || "0")}}>
              <option label="Select a contract:" defaultValue={`Select a contract`}>Select an ERC20 Token or a contract to interact with or insert its address in the following field:</option>
              
              {tokens[network.name.toLowerCase()]?.length > 0 && tokens[network.name.toLowerCase()]?.map((item,i)=>{
                return(<option key={i} value={item.address}>Symbol: {item.symbol} Decimals: {item.decimals} Address: {item.address}</option>)
              })}
            </select>
            <br/>

            {advanced?
            <input
              type="text"
              value={txTo}
              placeholder='contract address to interact with'
              onChange={(e) => {setTxTo(e.target.value || "0x0")}}
              className={styles.input}            
            />
            :
            <input
              type="text"
              value={txTo}
              placeholder='contract address to interact with'
              onChange={(e) => {setTxTo(e.target.value || "0x0")}}
              className={styles.input}
              disabled
            />
            }
            
            <br/><br/>
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
          
          <label>TX Value (Ether to transfer):</label>
          {isCallToContract?
          <>
          <input
            type="number"
            placeholder='eth value'
            min={0}
            value={txValue || "0"}
            step="0.01"
            onChange={(e) => setTxValue(e.target.value || "0")}
            className={styles.input}
          /><br/><br/>
          </>
          :
          <>
          <input
            type="number"
            placeholder='eth value'
            min={0}
            value={txValue || "0"}
            step="0.01"
            onChange={(e) => setTxValue(e.target.value || "0")}
            className={styles.input}
          /><br/><br/>
          </>
          }

          <label>TX Data (*Optional Message Data or Contract Calldata serialized and encoded):</label>

          {isCallToContract && (
            <>
              <select className={styles.select} onChange={(e) => {setParamType1(e.target.value)}}>
                <option label="Select an address whitelisted:" defaultValue={`Select an address`}>Insert the address receiver</option>
                {whitelist.map((item, i) => {
                  return(<option key={i} value={item}>{tokens[network.name.toLowerCase()]?.map((el)=>{if(el.address === item){return `[Token]: ${el.symbol} [Decimals]:${el.decimals}`}})} {item}</option>)
                })}
              </select>

              <input
              type="number" 
              placeholder="<Amount * 10 ** ERC20 Token Decimals>" 
              className={styles.input} 
              min={0} 
              step={0.01} 
              onChange={(e) => {setParamType2(e.target.value)}}/>
            
              <select className={styles.select} onChangeCapture={(e) => {setSelector(e.target.value || "0")}}>
                <option label="Select an action:" defaultValue={`Select an action`}>Select an action:</option>
                
                {actions.map((item,i) => {
                  return(<option key={i} value={item.calldata}>{item.type} : {item.calldata} - {item.description}</option>)
                })}
              </select>
              <button className={styles.button1} onClick={(e)=>encodeCalldata()}>encode</button>
              <br/><br/>
            </>
          )}
          
          {advanced?
            <>
              <input
                type="text"
                placeholder={isCallToContract?'`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`':''}
                value={txData !== "0" ? txData : isCallToContract?"0":""}
                onChange={(e) => setTxData(e.target.value || "0")} //ethers.utils.parseEther(e.target.value)
                className={styles.input}
              /><br/>
            </>
            : 
            <>
              <input
                type="text"
                placeholder={isCallToContract?'`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`':''}
                value={txData !== "0" ? txData : isCallToContract?"0":""}
                onChange={(e) => setTxData(e.target.value || "0")} //ethers.utils.parseEther(e.target.value)
                className={styles.input}
                disabled        
              /><br/>
            </>
          }

          <br/>

          {isTypeAdvanced && (<><label><i>timelock</i> [<code className={styles.col_exe}>{JSON.stringify(toggleTimeLock)}</code>]<input type="checkbox" onChange={()=>setToggleTimeLock(!toggleTimeLock)} checked={toggleTimeLock}/></label><br/></>)}
          
          {toggleTimeLock && (
            <>
              <label> Blocks </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max={324000}
                value={timeLock}
                onChange={(e) => setTimeLock(e.target.value || "0")}
              />
              <label> Days </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max={365}
                //value={daylock}
                onChange={(e) => setTimeLock((e.target.value * 7200) || "0")}
              />
              {/* <label> Day*Blocks </label>
              <input type="number" placeholder="days in blocks" step="7200" value={7200} disabled/> */}
              <br/>
            </>
          )}    

          <br/>

          <label><b>calldata</b> [<code className={styles.col_exe}>{JSON.stringify(isCallToContract)}</code>]</label>
          <input type="checkbox" onChange={(e)=>setIsCallToContract(!isCallToContract)} checked={isCallToContract}/><br/>

          <code>* Check this if you need to encode a call to a contract </code>
          <br/>
          <code>** ERC20 transfer calldata example: `approve(address,uint256)0xabcdef123456,1000000000000000000` and then `transfer(address,uint256)0xabcdef123456,1000000000000000000` </code>
          <br/>
          
          {true && (
            <><br/>
              <label><b>advanced</b> [<code className={styles.col_exe}>{JSON.stringify(advanced)}</code>]</label>
              <input type="checkbox" onChange={(e)=>setAdvanced(!advanced)} checked={advanced}/><br/>
            </>
          )}

          <br/>

          <div className={styles.inputDiv}>
            <h3>Preview</h3>
            <p>to: {txTo}</p>
            <p>value: {txValue.toString()} ETH</p>
            <p>data: {txData} </p>
            {toggleTimeLock && (<p>timelock: {timeLock}</p>)}

            {isCallToContract && (
              <>
                <p>data serialized: {txData != null && encodeMethod(txData||"0").hex.toString()}</p>
                <p>data encoding: {JSON.stringify(encodeMethod(txData))}</p>
              </>
            )}
            
            <button onClick={submitTxTrusty} className={styles.button}>Submit</button>          
          </div>
        </div>
      )
    }

    // GET TRUSTY TX
    const renderTrustyTx = (x, y) => {
      if (loading) {
        return <button className={styles.button}>Loading transactions...</button>;
      }
      return (
        <div className={styles.inputDiv}>
          <h3>Transactions</h3>
          <hr/>
          Total TXs: {totalTx.toString()} <br />

          <label><i>filter executed</i> [<code className={styles.col_exe}>{JSON.stringify(toggleExecuted)}</code>]</label>
          <input type="checkbox" onChange={()=>setToggleExecuted(!toggleExecuted)}/>
          <hr/>
          <div className={styles.txs}>
            
            {!toggleExecuted && transactions.map((item,i) => (
              
              <span key={i} className={styles.tx}>
                <p>id: {i}</p>
                <p>To: {item.to.toString()}</p>
                <p>Value: <span className={styles.col_val}>{(item.value / ethDecimals).toString()} ETH</span></p>
                <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
                <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
                <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
                <p>Confirmations: {item.numConfirmations.toString()}</p>
                <p>Block: {item.blockHeight?item.blockHeight.toString():"N/A"}</p>
                <p>Timestamp: {item.timestamp?new Date(item?.timestamp * 1000).toLocaleString():"N/A"}</p>
                {isTypeAdvanced && (<p>Timelock: {item.timeLock?item.timeLock.toString():"N/A"}</p>)}

                {!item.executed == true && (
                  <div>
                    <button onClick={() => { confirmTxTrusty(i) }} className={styles.button1}>confirm</button>
                    <button onClick={() => { revokeTxTrusty(i) }} className={styles.button2}>revoke</button>
                    <button onClick={() => { executeTxTrusty(i) }} className={styles.button3}>execute</button>

                  </div>
                )}
              </span>
              
            ))}

            
            {toggleExecuted && transactions.map((item,i) => (
              !item.executed && (
              <span key={i} className={styles.tx}>
              <p>id: {i}</p>
              <p>To: {item.to.toString()}</p>
              <p>Value: <span className={styles.col_val}>{(item.value / ethDecimals).toString()} ETH</span></p>
              <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
              <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
              <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
              <p>Confirmations: {item.numConfirmations.toString()}</p>
              <p>Block: {item.blockHeight?item.blockHeight.toString():"N/A"}</p>
              <p>Timestamp: {item.timestamp?new Date(item?.timestamp * 1000).toLocaleString():"N/A"}</p>
              {isTypeAdvanced &&(<p>Timelock: {item.timeLock?item.timeLock.toString():"N/A"}</p>)}

              {!item.executed == true && (
                <div>
                  <button onClick={() => { confirmTxTrusty(i) }} className={styles.button1}>confirm</button>
                  <button onClick={() => { revokeTxTrusty(i) }} className={styles.button2}>revoke</button>
                  <button onClick={() => { executeTxTrusty(i) }} className={styles.button3}>execute</button>

                </div>
              )}
              </span>
              )
            ))}
          </div>
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
                <Link href="/" className={styles.link}>Dashboard</Link>
            </div>
            <div className={styles.main}>
                <h1 className={styles.col_title}>TRUSTY Single / Recovery <code className={styles.col_dec}>{network.name}</code></h1>

                {!walletConnected && (
                  <>
                      <button className={styles.button1} onClick={()=>{connectWallet()}}>CONNECT</button>
                  </>
                )}

                <div className={styles.description}>
                    Wallet: <code><span className={styles.col_dec}><Link href={`https://${network.name}.etherscan.io/address/${account}`} target={`_blank`}>{account}</Link></span></code> <br />
                    Balance: <strong><span className={styles.col_val}>{balance}</span></strong> ETH <br />
                </div>

                {renderTrusty()}

                {notification != null &&
                    <div className={styles.notification}>
                    <button onClick={clear}>x</button>
                    <code className={styles.col_dec}>[LOG]</code>: <code>{notification}</code>
                    </div>
                }
            </div>
            <footer className={styles.footer}>
                <code>
                Copyright &copy; {new Date().getFullYear()} Ramzi Bougammoura <br/>
                Made with &#10084; by <Link href="https://x.com/0xrms_" target="_blank"> 0xrms </Link>
                </code>
            </footer>
        </div>
    )
}