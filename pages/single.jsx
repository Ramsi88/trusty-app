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
    mumbai: [],
    polygon: []
}

const actions = [
  {type: "ERC20", calldata: "approve(address,uint256)", description: "Approves and authorize sending to an ADDRESS an AMOUNT"},
  {type: "ERC20", calldata: "transfer(address,uint256)", description: "Transfer to an ADDRESS an AMOUNT"},
  {type: "Factory", calldata: "trustyConfirm(uint256,uint256)", description: "Use this to confirm a transaction from Factory when you have more than a Trusty linked"},
  {type: "Factory", calldata: "trustyExecute(uint256,uint256)", description: "Use this to execute a transaction from Factory when you have more than a Trusty linked"},
  {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to confirm a transaction when you have more than a Trusty linked"},
  {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to execute a transaction when you have more than a Trusty linked"},
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
      //polygon: {id: 137, name: "Polygon Mainnet", contract:""},
      mumbai: {id: 80001, name: "Mumbai Testnet", contract:""},
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
    const [CONTRACT_ADDRESS,setCONTRACT_ADDRESS] = useState("0x7060fA5180b61b87DEEeA5ED4535BbEc04a213c7");
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

    const [inputTrustyBlacklistValue, setInputTrustyBlacklistValue] = useState('');
    const [trustyBlacklist, setTrustyBlacklist] = useState([]);

    const trustyTokens = useRef([])

    const [totalTx, setTotalTx] = useState(0)
    const [transactions, setTransactions] = useState([]);
    const [toggleExecuted, setToggleExecuted] = useState(false);

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
            try {
              isOwner = await contract.isOwner(account);
            } catch(err) {
              console.log(`[ERROR]isOwner: ${err}`)
            }            

            if (isOwner) {
              setTrustyConnected(isOwner)
            } else {
              setTrustyConnected(isOwner)
            }

            try {
              const id = await contract.id()
              setId(id)
            } catch(err) {
              console.log(`[ERROR]trustyId: ${err}`)
            }            

            try {
              const trustyOwners = await contract.getOwners()             
              setOwners(trustyOwners)
            } catch(err) {
              console.log(`[ERROR]getOwners: ${err}`)
            }

            try {
              const genericErc20Abi = require('constants/erc20.json');

              const getTokens = [];
              if(tokens[network.name.toLowerCase()]){
                tokens[network.name.toLowerCase()].forEach(async (token) => {
                  const trustyAddr = CONTRACT_ADDRESS
                  const tokenContractAddress = token.address;
                  const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer);
            
                  const balance = (await contract.balanceOf(trustyAddr)).toString();
                  //console.log(`(${token.symbol}): ${balance}`)
            
                  getTokens.push(`(${token.symbol}): ${balance}`)
                });
              }
              
              trustyTokens.current = getTokens;
              
              const balance = await contract.getBalance() / ethDecimals
              setTrustyBalance(balance)
            } catch(err) {
              console.log(`[ERROR]getBalances: ${err}`)
            }
            
            try {
              const numConfirmationsRequired = parseInt(await contract.numConfirmationsRequired())
              setMinConfirmation(numConfirmationsRequired)
            } catch(err) {
              console.log(`[ERROR]threshold: ${err}`)
            }

            try {
              const absoluteLock = parseInt(await contract.absolute_timelock())
              setAbsoluteTimelock(absoluteLock)
            } catch(err) {
              console.log(`[ERROR]absoluteTimelock: ${err}`)
            }
            
            try {
              const whitelisted = await contract.getWhitelist()
              setWhitelist([...whitelisted])
            } catch(err) {
              console.log(`[ERROR]getWhitelist: ${err}`)
            }

            try {
              const recover = await contract.recoveryTrusty()
              setRecoveryTrusty(recover)
            } catch(err) {
              console.log(`[ERROR]recoveryTrusty: ${err}`)
            }
            
            try {
              const blacklisted = await contract.getBlacklist()
              setBlacklist(blacklisted)
            } catch(err) {
              console.log(`[ERROR]getBlacklist: ${err}`)
            }
            
            try {
              const totalTXS = parseInt(await contract.getTransactionCount())
              setTotalTx(totalTXS)
            } catch(err) {
              console.log(`[ERROR]totalTx: ${err}`)
            }
                        
            try {
              let txs = []
              for (let i=0;i<totalTx;i++) {
                const tx = await contract.getTransaction(i)
                console.log(tx)
                txs.push(tx)
              }
              setTransactions(txs)
            } catch(err) {
              console.log(`[ERROR]getTransactions: ${err}`)
            }
            
            /*
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
            */
        } catch (err) {
          console.log(err.message);
          notifica(err.message.toString());
        }
    }

    // DEPOSIT to TRUSTY
    async function depositToTrusty() {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const _contractAddr = await contract.depositContract(trustyID, utils.parseEther(addEther), { value: utils.parseEther(addEther), gasLimit: 300000 });
        setLoading(true);
        // wait for the transaction to get mined
        await _contractAddr.wait();
        setLoading(false);
        checkTrustyId();
        */
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    const addToTrustyBlacklist = async () => {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const addToTrusty = await contract.addToTrustyBlacklist(trustyID, trustyBlacklist);
        setLoading(true);
        // wait for the transaction to get mined
        await addToTrusty.wait();
        setLoading(false);
        getTrustyIDBlacklist()
        */
      } catch (err) {
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    const getOwners = async () => {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      try {
        const whitelisted = await contract.getWhitelist()
        whitelisted.wait()
        console.log(whitelisted)              
        setWhitelist([...whitelisted])
      } catch(err) {}
    }

    /*
    const handleTrustyInput = (e) => {
      if(inputTrustyValue !== "" && ethers.utils.isAddress(inputTrustyValue) && inputTrustyValue !== "0x0000000000000000000000000000000000000000") {
        e.preventDefault();
        setCONTRACT_ADDRESS(inputTrustyValue)
        setInputTrustyValue("");
        //connectToTrusty()
      } else {notifica(`You must specify a valid address to connect!`)}
    }
    */

    // Network
    // TrustyContract ? -> imOwner ?

    // submitTransaction
    // confirmTransaction
    // revokeConfirmation
    // executeTransaction
    // CONFIRM TX
    const confirmTxTrusty = async (id) => {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const txs = await contract.trustyConfirm(trustyID, id);
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        getTxTrusty();
        notifica(`You confirmed the Trusty tx id ${id}...`+txs.hash);
        */
      } catch (err) {
        setLoading(false);
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    // REVOKE TX
    const revokeTxTrusty = async (id) => {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const txs = await contract.trustyRevoke(trustyID, id);
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        getTxTrusty();
        notifica(`You revoked Trusty tx id ${id}... ${txs.hash}`);
        */
      } catch (err) {
        setLoading(false);
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    // EXECUTE TX
    const executeTxTrusty = async (id) => {
      try {
        /*
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        const txs = await contract.trustyExecute(trustyID, id, { gasLimit: 300000 });
        setLoading(true);
        // wait for the transaction to get mined
        await txs.wait();
        setLoading(false);
        checkTrustyId()
        getTxTrusty();
        notifica(`You succesfully executed the Trusty tx id ${id}... ${txs.hash}`);
        */
      } catch (err) {
        setLoading(false);
        console.log(err.message);
        notifica(err.message.toString());
      }
    }

    // addAddressToBlacklist
    
    // getOwners
    // getBalance
    // getTransactionCount
    // getTransaction
    // getWhitelist
    // getBlacklist

    // recover
    // recoverERC20

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
      if (walletConnected && trustyConnected) {
        connectToTrusty()
        //getOwners()
      }      
    }
    ,[
      CONTRACT_ADDRESS
    ]
    )

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
                    <button className={styles.button} onClick={connectToTrusty}>Connect to Trusty [{JSON.stringify(trustyConnected)}]</button>
                  </>
                }

                {walletConnected && trustyConnected &&
                <>
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
                  <code>Absolute Timelock: {absoluteTimelock}</code>
                  <br/>
                  <code>Recovery: {JSON.stringify(recoveryTrusty)}</code>
                  <br/>
                  <code>Balance: {JSON.stringify(trustyBalance)} ETH</code>
                  {trustyTokens.current != [] && trustyTokens.current.map((token,i)=>{
                    return <p key={i}><code className={styles.col_dec} key={token}>{token}</code></p>
                  })}
                  <br/>
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

                  <h3>TRANSACTIONS</h3>
                  <br/>
                  <code>Total Tx: {JSON.stringify(totalTx)}</code>
                  <br/>
                  <code>Transactions: {JSON.stringify(transactions)}</code>
                  {renderTrustyTx()}
                  <hr/>
                </>
                }

                {walletConnected && trustyConnected && renderManageTrusty()}
            </>
        )
    }

    const renderManageTrusty = () => {
      return(
        <>
          <h2>MANAGE</h2>
          <label>ETHER amount to deposit:</label>
          <input
            type="number"
            placeholder="<Amount of Ether> example: 0.10"
            min={0}
            step="0.01"
            onChange={(e) => setAddEther(e.target.value || "0")}
            className={styles.input}
          />
          <button onClick={depositToTrusty} className={styles.button}>Deposit to Trusty {id}</button>

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

          <button className={styles.button} onClick={addToTrustyBlacklist}>ADD to Trusty Blacklist</button>

          <ul>
            {blacklist.map((item,i) => {
              return (<li key={i}>[{i}] : {item}</li>)
            })}
          </ul>
        </>
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
                <p>id: {item.id}</p>
                <p>To: {item.to.toString()}</p>
                <p>Value: <span className={styles.col_val}>{item.value.toString()} ETH</span></p>
                <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
                <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
                <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
                <p>Confirmations: {item.numConfirmations.toString()}</p>
                <p>Block: {item.blockHeight?item.blockHeight.toString():"N/A"}</p>
                <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p>

                {!item.executed == true && (
                  <div>
                    <button onClick={() => { confirmTxTrusty(item.id) }} className={styles.button1}>confirm</button>
                    <button onClick={() => { revokeTxTrusty(item.id) }} className={styles.button2}>revoke</button>
                    <button onClick={() => { executeTxTrusty(item.id) }} className={styles.button3}>execute</button>

                  </div>
                )}
              </span>
              
            ))}

            
            {toggleExecuted && transactions.map((item,i) => (
              !item.executed && (
              <span key={i} className={styles.tx}>
              <p>id: {item.id}</p>
              <p>To: {item.to.toString()}</p>
              <p>Value: <span className={styles.col_val}>{item.value.toString()} ETH</span></p>
              <p>Data: <span className={styles.col_data}>{item.data.toString()}</span></p>
              <p>Decode Data: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
              <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
              <p>Confirmations: {item.numConfirmations.toString()}</p>
              <p>Block: {item.blockHeight?item.blockHeight.toString():"N/A"}</p>
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