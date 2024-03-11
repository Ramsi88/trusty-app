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
{type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to execute a transaction when you have more than a Trusty linked"}
]


export default function Home() {
    const [network,setNetwork] = useState({});
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);
    const [CONTRACT_ADDRESS,setCONTRACT_ADDRESS] = useState("");
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [trustyConnected, setTrustyConnected] = useState(false)
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
        /*
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
        */
        if (needSigner) {
        const signer = web3Provider.getSigner();
        
        setAccount(await signer.getAddress())
        
        setBalance((await signer.getBalance() / ethDecimals).toString().slice(0, 10));
        
        return signer;
        }
        
        return web3Provider;
    };

    async function connectToTrusty() {
        console.log("trigger")
        if(!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
            notifica(`[Address] ${CONTRACT_ADDRESS} is not valid!`)
            setTrustyConnected(false)
            return
        }
        try {
            const signer = await getProviderOrSigner(true);
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            let isOwner = await contract.isOwner(account);
            console.log(`[isOwner]: ${JSON.stringify(isOwner)}`)

            if (isOwner) {
                setTrustyConnected(isOwner)
            } else {
                setTrustyConnected(isOwner)
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

    // Network
    // TrustyContract ? -> imOwner ?

    // submitTransaction
    // confirmTransaction
    // revokeConfirmation
    // executeTransaction

    // addAddressToBlacklist
    
    // getOwners
    // getBalance
    // getTransactionCount
    // getTransaction
    // getWhitelist
    // getBlacklist

    // recover
    // recoverERC20

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

    const renderTrusty = () => {
        return(
            <>
                <label>Insert the Trusty or Recovery address you want to connect to:</label>
                <input
                    type="text"
                    placeholder='<address> example: 0xABCDEF0123456abcdef...'
                    onChange={(e) => setCONTRACT_ADDRESS(e.target.value || "")}
                    className={styles.input}
                />
                <button className={styles.button} onClick={connectToTrusty}>Connect to Trusty [{JSON.stringify(trustyConnected)}]</button>

                {CONTRACT_ADDRESS}
            </>
        )
    }

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
                <h1>TRUSTY Single / Recovery</h1>

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