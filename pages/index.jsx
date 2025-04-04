/**
 * TRUSTY-dApp v0.1.0
 * Copyright (c) 2024 Ramzi Bougammoura
 */

import { Contract, ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from 'next-themes';

//FACTORY_ADDRESS,
import { FACTORY_ABI, CONTRACT_ABI } from "../constants";
import styles from "../styles/Home.module.css";

import { decodeCalldata } from "../components/calldata";

//const { keccak256 } = require("ethereum-cryptography/keccak");

//const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

import Doc from "../components/doc";
//import Api from "../components/api";

const ethDecimals = 10**18;

const getNetworkState = false;

/** TRUSTY VAULT MAINNET FACTORY
 * v1 MAINNET 0x91b3920e3F9813ded3AC0A7bF24D8a97352ac8C2
 */
/** POLYGON
 * v1 Polygon 0x91b3920e3F9813ded3AC0A7bF24D8a97352ac8C2
 */
/** GOERLI
 * v0.1.4 0x6Fb80eD4Dc22307Fc54851d6f051399ac1357A1f - Recovery 0xB50A82E9996B1aFA0b1ab6e3984f0b6ebD75de11
 * v0.1.3 0x4CDaE8e38dcD36FCD611224eF8D208D13cacA741
 * v0.1.3 0xa13886f196837dc784fB36b6482Fc056F305ECb0
 * v0.1.2 0x034aCC292F3aDc793B21A047398Afb3f0B32FEE4
 * v0.1.1 0xB4Fa8AdC5863788e36adEc7521d412BEa85d6Dbe
 * v0.1 0xA2bDd8859ac2508A5A6b94038d0482DD216A59A0
 * v0.0 0xebb477aaabaedd94ca0f5fd4a09aa386a9290394
*/
/** SEPOLIA
 * v2.0.0 0xd0a025E42a6a19e527609F8f300346d4Ab8aAEcd - Factory Advanced -> TrustyAdvanced
 * v2.0.0 0x195ED9E5aA1275452aCa2C158C4Ef7Fcd04877E3 - Factory -> Trusty
 * v0.1.5 0x1f4f156f079a0E6e55d5687c3f32B575232d036E - Factory -> Trusty Type Simple
 * v0.1.4 0xE23Cb7db107cE64a4c675Ee14278162E64D3585d - Recovery 0x2D09205871aC539e14Fd5b2Db9c7d00DaD4A1386
 * v0.1.4 0xd12d9FBB37569017f004F0984039067BE7e0383c - Recovery 0x53E6548cA35c3009aFCaA4Bf3d6fe415D61Db46E
 * v0.1.3 0x2139EE209aC63471E2Bb522Af904C84c66e33f88
 * v0.1.2 0xf2Be9b34Ef25a89eE5c170594eE559f17cb967Bf
 * v0.1.2 0xE3f25232475D719DD89FF876606141308701B713
 * v0.1.1 0x852217deaf824FB313F8F5456b9145a43557Be37
*/
/** MUMBAI
 * v0.1.4 0x2139EE209aC63471E2Bb522Af904C84c66e33f88 - Recovery 0x53E6548cA35c3009aFCaA4Bf3d6fe415D61Db46E
 * v0.1.3 0x494fe262Cd4149C50dfa4D56C4731cDb0b02e7F5
 * v0.1.2 0xE3f25232475D719DD89FF876606141308701B713
 */
/** AMOY
 * v0.1.5 0xE3f25232475D719DD89FF876606141308701B713 - Factory -> Trusty Type Simple
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
  polygon: []
}

const actions = [
  {type: "ERC20", calldata: "approve(address,uint256)", description: "Approves and authorize sending to an ADDRESS an AMOUNT"},
  {type: "ERC20", calldata: "transfer(address,uint256)", description: "Transfer to an ADDRESS an AMOUNT"},
  {type: "Factory", calldata: "trustyConfirm(uint256,uint256)", description: "Use this to confirm a transaction from Factory when you have more than a Trusty linked"},
  {type: "Factory", calldata: "trustyExecute(uint256,uint256)", description: "Use this to execute a transaction from Factory when you have more than a Trusty linked"},
  {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to confirm a transaction when you have more than a Trusty linked"},
  {type: "Trusty", calldata: "confirmTransaction(uint256)", description: "Use this to execute a transaction when you have more than a Trusty linked"},
  //{type: "Recovery", calldata: "recover()", description: "Use this to execute an ETH Recover of a Trusty in Recovery mode"},
  //{type: "Recovery", calldata: "recoverERC20(address)", description: "Use this to execute an ERC20 Recover of a Trusty in Recovery mode"},
  //{type: "Recovery", calldata: "unlock()", description: "Use this to execute an unlock updating the Absolute Timelock of a Trusty in Recovery mode"}
]

//{block,price,gas,usdBalance}
export default function Home() {
  const networks = {
    mainnet : {id: 1, name: "Mainnet", contract:"0x91b3920e3F9813ded3AC0A7bF24D8a97352ac8C2"},
    goerli: {id: 5, name: "Goerli", contract:"0x6Fb80eD4Dc22307Fc54851d6f051399ac1357A1f"},
    sepolia: {id: 11155111, name: "Sepolia", contract:"0x1f4f156f079a0E6e55d5687c3f32B575232d036E"},
    polygon: {id: 137, name: "Polygon", contract:"0x91b3920e3F9813ded3AC0A7bF24D8a97352ac8C2"},
    mumbai: {id: 80001, name: "Mumbai", contract:"0x2139EE209aC63471E2Bb522Af904C84c66e33f88"},
    amoy: {id: 80002, name: "Amoy", contract: "0xE3f25232475D719DD89FF876606141308701B713"},
    //base: {id: 8453, name: "Base", contract:""},
    //optimism: {id: 10, name: "Optimism", contract:""},
    //arbitrum: {id: 42161, name: "Arbitrum", contract:""},
  }
  const { theme, setTheme } = useTheme();
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
  //const web3ModalRef = useRef();
  // This variable is the `0` number in form of a BigNumber
  const zero = BigInt(0);  
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
  const [confirms, setConfirms] = useState(1);

  const countOwners = useRef(0);
  const [addMoreOwners,setAddMoreOwners] = useState(false);
  const [moreOwners,setMoreOwners] = useState([]);
  const [inputOwnersValue,setInputOwnersValue] = useState('');

  // Recovery
  const [recovery, setRecovery] = useState("")

  // BlockLock
  const [blockLock, setBlockLock] = useState(0)

  //WHITELIST
  const [maxWhitelisted, setMaxWhitelisted] = useState(0);
  const [addressesWhitelisted, setAddressesWhitelisted] = useState(0);
  const [factoryWhitelist,setFactoryWhitelist] = useState([]);
  const [trustyWhitelist, setTrustyWhitelist] = useState([]);
  const [trustyBlacklist, setTrustyBlacklist] = useState([]);
  const [inputFactoryWhitelistValue, setInputFactoryWhitelistValue] = useState('');
  const [inputTrustyWhitelistValue, setInputTrustyWhitelistValue] = useState('');
  const [inputTrustyBlacklistValue, setInputTrustyBlacklistValue] = useState('');
  const [getTrustyWhitelist, setGetTrustyWhitelist] = useState([]);
  const [getTrustyBlacklist,setGetTrustyBlacklist] = useState([]);
  const [factoryMaxWhitelist, setFactoryMaxWhitelist] = useState(100);

  const [whitelisted, setWhitelisted] = useState(false);

  //TIME_LOCK
  const [timeLock,setTimeLock] = useState(0);
  const [toggleTimeLock,setToggleTimeLock] = useState(false);

  //Trusty Owners
  const [trustyOwners,setTrustyOwners] = useState();
  const [threshold, setThreshold] = useState(0)

  const [trustyRecovery, setTrustyRecovery] = useState("")
  const [absoluteTimelock, setAbsoluteTimelock] = useState(0)

  //Trusty created list & deposit
  const [totalTrusty, setTotalTrusty] = useState(0);
  const [TRUSTY_ADDRESS, setTRUSTY_ADDRESS] = useState([]);
  const [trustyID, setTrustyID] = useState(null);
  const [trustyName, setTrustyName] = useState("");
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
  const [txValue, setTxValue] = useState("0");
  const [txData, setTxData] = useState("0");
  const [selector, setSelector] = useState("");
  const [paramtype1,setParamType1] = useState("");
  const [paramtype2,setParamType2] = useState("");

  const [isCallToContract,setIsCallToContract] = useState(false);
  const [advanced, setAdvanced] = useState(false);
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

  const ThemeToggle = () => {
    return (
      <div className={styles.theme}>
        <button className={styles.btn} onClick={() => setTheme('light')}>Light</button>
        <button className={styles.btn} onClick={() => setTheme('dark')}>Dark</button>
      </div>
    );
  }

  const checkWhitelisted = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const isWhitelisted = await contract.whitelistedAddresses(account);
      setWhitelisted(isWhitelisted);
    } catch (err) {
      setWhitelisted(false)
      console.error(err);
      notifica(err.message.toString());
    }
    
  }

  const whitelistMe = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const tx = await contract.whitelistMe({
        value: ethers.parseEther(trustyPrice),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      checkWhitelisted();
      notifica("You have been successfully whitelisted... "+JSON.stringify(tx.hash));
    } catch (err) {
      console.error(err);
      notifica(err.message.toString());
    }
  }

  /**
   * createTrusty: Create a Trusty MultiSig Contract from TrustyFactory
   */
  const createTrusty = async () => {
    const array = []
    array.push(owner1);
    array.push(owner2);
    //array.push(owner3);
    array.push(...moreOwners)
    setOwnerToTrusty(array);
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      // call the mint from the contract to mint the Trusty //'["","",""],1'
      const tx = await contract.createContract(array, confirms, trustyName,/*  trustyWhitelist, recovery, blockLock, */ {
        // value signifies the cost of one trusty contract which is "0.1" eth.
        // We are parsing `0.1` string to ether using the utils library from ethers.js
        value: ethers.parseEther(priceEnabler?trustyPrice:"0"),
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
    if (true) {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        // We will get the signer now to extract the address of the currently connected MetaMask account
        const signer = await getProviderOrSigner(true);
        //console.log("[Signer]: ", signer)
        // Get the address associated to the signer which is connected to  MetaMask
        const address = await signer.getAddress();
        //console.log("[SignerAddr]: ", address)

        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        // call the owner function from the contract
        const _owner = await contract.owner();
        //console.log("[FactoryOwner]: ", _owner)

        if (FACTORY_ADDRESS != null && address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
          const factoryB = (Number(await provider.getBalance(FACTORY_ADDRESS)) / ethDecimals).toString();
          setBalanceFactory(factoryB);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.error(err.message);
        notifica(err.message.toString());
      }
    }
  };

  async function withdraw() {
    try {
      console.log("admin withdraw");
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const withdraw = await contract.withdraw();
      setLoading(true);
      await withdraw.wait();
      setLoading(false);
      notifica(`ADMIN withdraw success!`)
      getFactoryOwner();
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function priceConfig() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const priceConf = await contract.trustyPriceConfig(ethers.parseEther(trustyPriceSet));
      setLoading(true);
      // wait for the transaction to get mined
      await priceConf.wait();
      setLoading(false);
      getDetails();
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  async function depositFactory() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const tx = await contract.fallback({ value: ethers.parseEther(deposit), gasLimit: 300000 });
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
      setLoading(true);
      // wait for the transaction to get mined
      await setPriceEnabler.wait();
      setLoading(false);
      getDetails();
      //setPriceEnabler(setPriceEnabler);
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const setMaxWhitelistFactory = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const setMaxConf = await contract.setMaxWhitelist(factoryMaxWhitelist);
      setLoading(true);
      // wait for the transaction to get mined
      await setMaxConf.wait();
      setLoading(false)
      getDetails()
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }
  
  const addAddressToFactoryWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const addFactoryWhitelist = await contract.addToFactoryWhitelist(factoryWhitelist);
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

  const getTrustyIDBlacklist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const getTrusty = await contract.getTrustyBlacklist(trustyID);
      setGetTrustyBlacklist(getTrusty)
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  const addToTrustyBlacklist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const addToTrusty = await contract.addToTrustyBlacklist(trustyID, trustyBlacklist);
      setLoading(true);
      // wait for the transaction to get mined
      await addToTrusty.wait();
      setLoading(false);
      getTrustyIDBlacklist()
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
      try {
        const _contractAddr = await contract.contracts(x);
        const _name = await contract.trustyID(x);
        setTRUSTY_ADDRESS(_contractAddr);
        trustyBox.push({ id: x, address: _contractAddr, name: _name });
      } catch(err) {
        console.log(err)
      }
      
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
      const price = (Number(await contract._price()) / ethDecimals).toString().slice(0, 10);      
      setTrustyPrice(price);
      const getPriceEnabler = await contract._priceEnabled();
      setPriceEnabler(getPriceEnabler);
      const getMaxWhitelisted = Number(await contract.maxWhitelistedAddresses());
      setMaxWhitelisted(getMaxWhitelisted);
      const getAddressesWhitelisted = Number(await contract.numAddressesWhitelisted());
      setAddressesWhitelisted(getAddressesWhitelisted);
      //console.log(total, price, getPriceEnabler, getMaxWhitelisted, getAddressesWhitelisted)
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }

  // CHECK TRUSTY BALANCE
  async function checkTrustyId() {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    const genericErc20Abi = require('../constants/erc20.json');

    const getTokens = [];
    if(tokens[network.name.toLowerCase()]){
      tokens[network.name.toLowerCase()].forEach(async (token) => {
        const trustyAddr = TRUSTY_ADDRESS.filter(id=>{if(id.id==trustyID){return id.address}})[0].address
        const tokenContractAddress = token.address;
        const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer);
  
        const balance = (await contract.balanceOf(trustyAddr))//.toString();

        if (balance > 0) {
          const decimals =  tokens[network.name.toLowerCase()]?.find((el)=>{if(el.address == tokenContractAddress){return el.decimals}})?.decimals || 0
  
          getTokens.push(`${token.symbol}: ${balance / 10**decimals}`)
        }        
      });
    }
    
    trustyTokens.current = getTokens;
    
    const balance = (Number(await contract.contractReadBalance(trustyID)) / ethDecimals).toString();
    setTrustyBalance(balance);
  }

  // CHEK TRUSTY OWNERS
  async function checkTrustyOwners() {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    //const trustyAddr = TRUSTY_ADDRESS.find(id=>{if(id.id==trustyID){return id.address}})[0]
    const trustyAddr = TRUSTY_ADDRESS.find((el) => {if (el.id === trustyID) return el.address}).address
    if (!trustyAddr) {
      //console.log("No trustyAddr")
      return
    }
    const trusty = new Contract(trustyAddr,CONTRACT_ABI, signer);
    const minConfirmations = parseInt(await trusty.numConfirmationsRequired());
    setThreshold(minConfirmations);
    // try {
    //   const recover = await trusty.recoveryTrusty();
    //   setTrustyRecovery(recover)
    // } catch(err) {}
    
    // try {
    //   const absTimeLock = await trusty.absolute_timelock();
    //   setAbsoluteTimelock(parseInt(absTimeLock))
    // } catch(err) {}

    const owners = (await contract.contractReadOwners(trustyID))
    setTrustyOwners(owners);
  }

  // DEPOSIT to TRUSTY
  /*
  async function depositToTrusty() {
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      const _contractAddr = await contract.depositContract(trustyID, ethers.parseEther(addEther), { value: ethers.parseEther(addEther), gasLimit: 300000 });
      setLoading(true);
      // wait for the transaction to get mined
      await _contractAddr.wait();
      setLoading(false);
      checkTrustyId();
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }
  */

  // SUBMIT TX to Trusty
  async function submitTxTrusty() {
    if (trustyID == null) {
      notifica(`You must select a Trusty from which you will send the transaction proposal, selected: [${trustyID}]`)
      return;
    }
    if (!ethers.isAddress(txTo)) {
      notifica(`You must insert a valid address: [${txTo}]`)
      return;
    }
    try {
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      if(isCallToContract) {
        let obj = encodeMethod(txData);
        const tx = await contract.trustySubmit(trustyID, txTo, ethers.parseEther(txValue), obj.hex/* , timeLock */);
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        clearTxParameter();
        getTxTrusty();
        notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
      } else {
        const tx = await contract.trustySubmit(trustyID, txTo, ethers.parseEther(txValue), ethers.getBytes(Buffer.from(txData)) /* , timeLock */);
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
            //console.log("startArr",data[i]);isArr=true;
          }
          else if(data[i]==="]" && isParam === true && isArr) {
            //console.log("endArr",data[i]);isArr=false;
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
      obj.method = ethers.keccak256(Buffer.from(types)).slice(0,10);
      obj.hex = `${obj.method}`;

      for(let i=0;i<obj.arg.length;i++){
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
        } else {
        }
        // 3 >>>>> number array
        if(obj.arg[i].length > 0) {
          obj.hexn++;
          obj.hex+=`${thirdTopic(obj.arg[i])}`;
        }
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
      else if (arg.startsWith("0x") && arg.length === 42) {
        arg=arg.slice(2);
        const topic = arg;
        return "0".repeat(64-arg.length)+topic;      
      }
      // is type BYTES calldata
      else if (arg.startsWith("0x") && arg.length > 42) {
        //console.log(">>>")
        arg=arg.slice(2)
        return arg
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
          //console.log(gettxs)
          box.push({ 
            id: i,
            to: gettxs[0],
            value: Number(gettxs[1]) / ethDecimals,
            data: gettxs[2], executed: gettxs[3],
            confirmations: Number(gettxs[4]),
            block: Number(gettxs[5]) ? Number(gettxs[5]):"N/A",
            //timelock: gettxs[6]?gettxs[6]:"N/A",
            timestamp: Number(gettxs[6]) ? Number(gettxs[6]) : "N/A"
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
      checkTrustyId()
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
    //let web3Provider;
    let provider;

    // Modern dApp Browsers
    if (window.ethereum) {
      //web3Provider = new ethers.BrowserProvider(await web3ModalRef.current.connect())
      provider = new ethers.BrowserProvider(window.ethereum)
      try {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = accounts[0]
        //console.log("[Account]: ", account)
        // window.ethereum.enable().then(async () => {
        //   const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        //   const account = accounts[0]
        //   console.log("[Account]: ", account)
        // })
      } catch (error) {
        console.log(error)
      }
    } else if (window.web3) {
      provider = new ethers.BrowserProvider(window.web3.currentProvider)
      //console.log("[Web3]: ", window.web3)      
    } else {
      console.log("You have to install a web3 wallet")
    }

    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    //const provider = await web3ModalRef.current.connect();
    //const web3Provider = new providers.Web3Provider(provider); //new Web3(provider); //"https://mainnet.infura.io/v3/"
    if (window.ethereum) {
      // If user is not connected to the Goerli network, let them know and throw an error
      const chainId = parseInt((await provider.getNetwork()).chainId); //await web3Provider.eth.defaultNetworkId //
      //console.log("[ChainId]: ", chainId)
      
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
    }
   
    if (needSigner) {
      //const signer = web3Provider.getSigner();
      const signer = await provider.getSigner();
      
      //setAccount(await signer.getAddress())
      setAccount(signer.address)
      //setOwner1(await signer.getAddress());
      setOwner1(signer.address);
      //const balance = Number(await web3Provider.getBalance(account))
      const balance = Number(await provider.getBalance(signer.address))
      
      //setBalance((await signer.getBalance() / ethDecimals).toString().slice(0, 10));
      setBalance((balance / ethDecimals).toFixed(8));
      
      return signer;
    }
    
    //return web3Provider;
    return provider;
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
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
        let total = Number(await contract.totalTrusty());
        let hasOwner = false;
        for (let i = 0; i < total; i++) {
          try {
            const _imOwner = await contract.imOwner(i);
            const _contractAddr = await contract.contracts(i);
            const _name = await contract.trustyID(i);

            //console.log(_imOwner, _contractAddr, _name)
            if (_imOwner == true) {
              box.push({ id: i, address: _contractAddr, name: _name });
            }
          } catch(err) {
            console.log(err)
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
        const provider = new ethers.BrowserProvider(window.ethereum);
        //const web3Provider = new providers.Web3Provider(provider);
        //const signer = provider.getSigner();
        
        block.current= await provider.getBlockNumber();
        const gasPrice = (await provider.getFeeData()).maxFeePerGas // gasPrice | maxFeePerGas | maxPriorityFeePerGas
        const gasAdjusted = ethers.formatUnits(gasPrice, 'gwei') // gwei | wei

        gas.current = Number(gasAdjusted).toFixed(2)
        //gas.current = parseInt(ethers.formatUnits(await ethers.getDefaultProvider().getGasPrice(), 'gwei')); //parseInt((await signer.getFeeData()).maxFeePerGas._hex);        
      },3000)
    }
  },[])

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    //console.log("Account trigger", account)
    setTrustyID(null);    
    setTRUSTY_ADDRESS([])
    setTRUSTY_TXS([])
    clearState()
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    try {
      if (!walletConnected) {
        // Assign the Web3Modal class to the reference object by setting it's `current` value
        // The `current` value is persisted throughout as long as this page is open
        
        // web3ModalRef.current = new Web3Modal({
        //   network: network.name, //"goerli",
        //   providerOptions: {},
        //   disableInjectedProvider: false,
        // });
        connectWallet();
      } else {
        getProviderOrSigner(true);
        checkAll();
        checkWhitelisted()
        // set an interval to get the number of Trusty Ids minted every 15 seconds
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
        //getTrustyIDWhitelist();
        //getTrustyIDBlacklist();
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
          checkWhitelisted();
          checkTrustyId();
          getTxTrusty();    
          //getTrustyIDWhitelist();  
          //getTrustyIDBlacklist();
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
    //console.log("Network trigger", network.name)
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
    if (window.ethereum && walletConnected) {
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
    if(inputOwnersValue !== "" && ethers.isAddress(inputOwnersValue)) {
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

  const handleTrustyBlacklistChange = (e) => {setInputTrustyBlacklistValue(e.target.value)}

  const handleFactoryWhitelistAdd = (e) => {
    if(inputFactoryWhitelistValue !== "" && ethers.isAddress(inputFactoryWhitelistValue)) {
      e.preventDefault();
      setFactoryWhitelist([...factoryWhitelist, inputFactoryWhitelistValue]);
      setInputFactoryWhitelistValue("");
    } else {notifica(`You must specify a valid address to whitelist!`)}
  }

  const handleTrustyWhitelistAdd = (e) => {
    if(inputTrustyWhitelistValue !== "" && ethers.isAddress(inputTrustyWhitelistValue) && inputTrustyWhitelistValue !== "0x0000000000000000000000000000000000000000") {
      e.preventDefault();
      setTrustyWhitelist([...trustyWhitelist, inputTrustyWhitelistValue]);
      setInputTrustyWhitelistValue("");
    } else {notifica(`You must specify a valid address to be whitelisted!`)}
  }

  const handleTrustyBlacklistAdd = (e) => {
    if(inputTrustyBlacklistValue !== "" && ethers.isAddress(inputTrustyBlacklistValue)) {
      e.preventDefault();
      setTrustyBlacklist([...trustyBlacklist, inputTrustyBlacklistValue]);
      setInputTrustyBlacklistValue("");
    } else {notifica(`You must specify a valid address to be blacklisted!`)}
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

  const clearTrustyBlacklistInput = () => {
    setTrustyBlacklist([]);
    setInputTrustyBlacklistValue("");
    console.log(`clearing blacklist ... [Trusty Blacklist]`,trustyBlacklist);
  }

  const renderWhitelistMe = () => {
    if (walletConnected && !whitelisted) {
      return (
        <div className={styles.inputDiv}>
          <button className={styles.button} onClick={whitelistMe}>
            WhitelistMe
          </button>
          {trustyPrice} ETH
        </div>
      );
    }
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
    if (walletConnected && whitelisted) {
      return (
        <div className={styles.inputDiv}>
          <button className={styles.button} onClick={createTrusty}>
            Create a Trusty
          </button>
          {priceEnabler?trustyPrice:"0"} {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}
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

          <legend><h3>Configure your Trusty</h3></legend>
          <label>Name</label>
          <input
            type="text"
            placeholder='<Name you Trusty> example: MyTrustyVault'
            onChange={(e) => setTrustyName(e.target.value || "")}
            className={styles.input}
          />
          <hr/>
          <label>Owner 1(You)</label>
          <input
            type="text"
            placeholder={owner1}
            className={styles.input}
            disabled
          />
          <label>Owner 2</label>
          <input
            type="text"
            placeholder='Owner 2'
            onChange={(e) => setOwner2(e.target.value || "0")}
            className={styles.input}
          />
          {/* <label>Owner 3:</label>
          <input
            type="text"
            placeholder='Owner 3'
            onChange={(e) => setOwner3(e.target.value || "0")}
            className={styles.input}
          /> */}
          <hr />

          <label>more Owners? [<span  className={styles.col_exe}>{JSON.stringify(addMoreOwners)}</span>]</label>
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
            placeholder="1"
            min="1"
            max={1 + countOwners.current}
            onChange={(e) => setConfirms(e.target.value || "1")}
            className={styles.input}
          />
          {/*
          <hr/>

          <label>TRUSTY WHITELIST</label><br/><br/>

          <code><i>(Use this field to add addresses to the whitelist in order to be able to send them any Ether or ERC20 token)</i></code>
          <br/>
          

          <input
            type="text"
            placeholder={`<Address to add to the Trusty's whitelist> example: 0x0123456789ABCdef...`}
            value={inputTrustyWhitelistValue}
            onChange={handleTrustyWhitelistChange}
            className={styles.input}
          />
          <br/>
          <code>* You will need also to insert the contract address of the ERC20 token you need to interact with in order to approve it and make it available to transaction submit and execution</code>
          <br/>
          <button className={styles.button3} onClick={handleTrustyWhitelistAdd}>update list</button>
          <button className={styles.button2} onClick={clearTrustyWhitelistInput}>clear list</button>  
          <hr/>

          <code>
            <label>[Addresses to whitelist]:</label>
            <ul>
            {trustyWhitelist.map((item,i) => {
              return (<li key={i}>[{i}] : {item}</li>)
            })}
            </ul>
          </code>

          <hr/>

          <label>RECOVERY ADDRESS</label>
          <p>* This address can recover the funds after the ABSOLUTE_TIMELOCK window has passed</p>
          <input
            type="text"
            placeholder={`<RECOVERY Address> example: 0x0123456789ABCdef...`}
            value={recovery}
            onChange={((e) => setRecovery(e.target.value || ""))}
            className={styles.input}
          /><br/>

          <hr/>

          <label>BlockLock:</label>
          <br/>
          <code>* Insert the days needed to set the Absolute Timelock in blocks number. </code>
          <code>** This will enable the RECOVERY mode after a specified block (input days * 7200 blocks/day) = AbsoluteTimelock window</code>
          <input
            type="number"
            placeholder="1-365 days"
            min={0}
            step={1}
            max={365}
            onChange={(e) => setBlockLock(Math.abs(e.target.value * 7200) || "0")}
            className={styles.input}
          />
          <code>Absolute Timelock for Recovery mode enabled will be set to {blockLock} blocks</code>
          */}
        </div>
      );
    }
  };

  // MANAGE the TRUSTY
  const renderActions = () => {
    return (
      <div id="manage" className={styles.inputDiv}>
        <legend><h3>Manage your Trusty</h3></legend>
        <hr/>

        <p>ID: <span className={styles.col_exe}>{trustyID}</span></p>

        <p>Name: <code className={styles.col_data}>{TRUSTY_ADDRESS.map(id=>{if(id.id==trustyID){return id.name}})}</code></p>
        
        {/* {renderOptions()} */}
        
        <label>Selected: <span className={styles.col_exe}>{TRUSTY_ADDRESS.map(id=>{if(id.id==trustyID){return id.address}})}</span></label>
        
        <br/>

        {/*trustyOwners != null && 
          <code>Owners: <span className={styles.col_data}>{trustyOwners}</span></code>
        */}

        <code>Owners:</code>
        <ul>
          {trustyID !== null && trustyOwners?.length > 0 && trustyOwners?.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul>

        {/*<p>Recovery: <code>{trustyRecovery}</code></p>*/}

        <p>Threshold: <span className={styles.col_exe}>{threshold}</span></p>

        {/*<p>Absolute Timelock: <code>{absoluteTimelock}</code></p>*/}

        <p>Balance: <span className={styles.col_val}>{trustyBalance}</span> {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}</p>

        {trustyTokens.current != [] && trustyTokens.current.map((token,i)=>{
          return <p key={i}><code className={styles.col_dec} key={token}>{token}</code></p>
        })}

        {/* <label>Amount to deposit:</label>
        <input
          type="number"
          placeholder="<Amount> example: 0.10"
          min={0}
          step="0.01"
          onChange={(e) => setAddEther(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={depositToTrusty} className={styles.button}>Deposit to Trusty {trustyID}</button> */}
        {/*
        <hr/>

        <label>Whitelist</label>

        <ul>
          {getTrustyWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul>

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
          {getTrustyBlacklist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul>
        */}
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
        <legend><h3>Submit a Trusty transaction proposal</h3></legend><br/>
        <hr/>
        <label>TX To (Receiver Address or Contract to interact):</label><br/>

        {isCallToContract?
        <>
          <select className={styles.select} onChange={(e) => {setTxTo(e.target.value || "0x0");setTxValue(txValue || "0");}}>
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
        
        <label>TX Value ({network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"} to transfer):</label>
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
            {/* <select className={styles.select} onChange={(e) => {setParamType1(e.target.value)}}>
              <option label="Select an address whitelisted:" defaultValue={`Select an address`}>Insert the address receiver</option>
              {getTrustyWhitelist.map((item, i) => {
                return(<option key={i} value={item}>{tokens[network.name.toLowerCase()]?.map((el)=>{if(el.address === item){return `[Token]: ${el.symbol} [Decimals]:${el.decimals}`}})} {item}</option>)
              })}
            </select> */}

            <input
             type="text" 
             placeholder="Insert the address receiver" 
             className={styles.input} 
             value={paramtype1}
             onChange={(e) => {
              setParamType1(e.target.value);
            }
              }/>

            <input
             type="number" 
             placeholder="<Amount * 10 ** ERC20 Token Decimals>" 
             className={styles.input} 
             min={0} 
             step={0.01}
             value={paramtype2}
             onChange={(e) => {
              setParamType2(e.target.value);    
            }
              }/>
           
            <select className={styles.select} onChangeCapture={(e) => {setSelector(e.target.value || "0")}}>
              <option label="Select an action:" defaultValue={`Select an action`}>Select an action:</option>
              
              {actions.map((item,i) => {
                return(<option key={i} value={item.calldata}>{item.type} : {item.calldata} - {item.description}</option>)
              })}
            </select>
            <button className={styles.button1} onClick={(e)=>{encodeCalldata()}}>encode</button>
            <br/><br/>
          </>
        )}
        
        {advanced?
          <>
            <input
              type="text"
              placeholder={isCallToContract?'`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`':''}
              value={txData !== "0" ? txData : isCallToContract?"0":""}
              onChange={(e) => setTxData(e.target.value || "0")} //ethers.parseEther(e.target.value)
              className={styles.input}
            /><br/>
          </>
          : 
          <>
            <input
              type="text"
              placeholder={isCallToContract?'`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`':''}
              value={txData !== "0" ? txData : isCallToContract?"0":""}
              onChange={(e) => setTxData(e.target.value || "0")} //ethers.parseEther(e.target.value)
              className={styles.input}
              disabled        
            /><br/>
          </>
        }

        <br/>
        {/*
        <label><i>timelock</i> [<code className={styles.col_exe}>{JSON.stringify(toggleTimeLock)}</code>]<input type="checkbox" onChange={()=>setToggleTimeLock(!toggleTimeLock)} checked={toggleTimeLock}/></label><br/>
        
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
            <br/>
          </>
        )}    
        
        <br/>
        */}
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
            <code>* Check this if you need to edit the `TO` and `DATA` fields</code>
            <br/>
          </>
        )}

        <br/>

        <div className={styles.inputDiv}>
          <h3>Preview</h3>
          <p>to: {txTo}</p>
          <p>value: {txValue.toString()} {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}</p>
          <p>data: {txData} </p>
          {toggleTimeLock && (<p>timelock: {timeLock}</p>)}

          {isCallToContract && (
            <>
              <p>data serialized: {txData != null && encodeMethod(txData||"0").hex.toString()}</p>
              <p>calldata decoded: {txData != null && decodeCalldata(encodeMethod(txData||"0")?.hex.toString())}</p>
              {/* <p>data encoding: {JSON.stringify(encodeMethod(txData))}</p> */}
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
          
          {!toggleExecuted && TRUSTY_TXS.map((item,i) => (
            (
            <span key={i} className={styles.tx}>
              <p>id: {item.id}</p>
              <p>To: {item.to.toString()}</p>
              <p>Value: <span className={styles.col_val}>{item.value.toString()} {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}</span></p>
              <p>Data Raw: <span className={styles.col_data}>{item.data.toString()}</span></p>
              <p>Data Message: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
              <p>Calldata: <span className={styles.col_dec}>{decodeCalldata(item.data)}</span></p>
              <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
              <p>Confirmations: {item.confirmations.toString()}</p>
              <p>Block: {item.block?item.block.toString():"N/A"}</p>
              {/* <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p> */}
              <p>Timestamp: {item.timestamp?new Date(item?.timestamp * 1000).toLocaleString():"N/A"}</p>

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
            <p>Data Raw: <span className={styles.col_data}>{item.data.toString()}</span></p>
            <p>Data Message: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
            <p>Calldata: <span className={styles.col_dec}>{decodeCalldata(item.data)}</span></p>
            <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
            <p>Confirmations: {item.confirmations.toString()}</p>
            <p>Block: {item.block?item.block.toString():"N/A"}</p>
            <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p>
            <p>Timestamp: {item.timestamp?new Date(item?.timestamp * 1000).toLocaleString():"N/A"}</p>

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
        <h3>FACTORY OWNER Panel</h3>
        Balance <code className={styles.col_val}>{balanceFactory}</code> {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}
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
        <button onClick={priceConfig} className={styles.button1}>Price Set Actual: [{trustyPrice}]</button>
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

        <label>WHITELIST</label>

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
          <label>[Update list]:</label>
          <ul>
          {factoryWhitelist.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
          </ul>
        </code>

        <button className={styles.button1} onClick={addAddressToFactoryWhitelist}>UPDATE Whitelist</button>
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

        <button className={styles.button1} onClick={setMaxWhitelistFactory}>Set Max Whitelisted</button>

        <code>
          <label>[whitelistable]:</label>
          <code className={styles.col_val}>{maxWhitelisted}</code>
          <br/>
          <label>[whitelisted]:</label>
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
        <Link href="#about" className={about?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setAbout(!about)}}>About</Link>
        <Link href="/" className={dashboard?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setDashboard(!dashboard)}}>Dashboard</Link>
        <Link href="#create" className={create?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setCreate(!create)}}>Create</Link>
        <Link href="#manage" className={manage?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setManage(!manage)}}>Manage</Link>
        <Link href="#submit" className={submit?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setSubmit(!submit)}}>Submit</Link>
        <Link href="#txs" className={TXS?styles.link_active+" "+styles.link: styles.link} onClick={(e)=>{setTXS(!TXS)}}>Transactions</Link>        
        <Link href="/v2" className={styles.link}>V2</Link>
        <Link href="/single" className={create?styles.link_active+" "+styles.link: styles.link}>Interface</Link>
      </div>
      <div className={styles.main}>
        <div>
          {/* THEME */}
          {ThemeToggle()}

          {network.name !== null &&(<h1 onClick={()=>getFactoryOwner} className={styles.title}>
            <p className={styles.col_title}>
              <Link href="/single">TRUSTY</Link>
              <code onClick={(e)=>{switchNetwork()}} className={styles.col_dec}> {network.name} </code>
            </p>
          </h1>)}

          {!walletConnected && (
            <>
              <button className={styles.button1 + " " + styles.col_data} onClick={()=>{connectWallet()}}>CONNECT</button>
            </>
          )}

          {about && (
          <div id="about" className={styles.about}>
            <h2>ABOUT</h2>
            <h3 className={styles.title}>
              Factory deployer and manager for multi-signatures smart contracts account/wallets <code>1/2+</code> or <code>2/3+</code>.
            </h3>

            <span>Create your own multi-signature safe and trust vault wallet on the blockchain and manage the execution of transactions with 1+ or m/n+ confirmations</span>

            <Doc/>
            
          </div>
          )}

          {network.name !== null && dashboard && (<>
          <div className={styles.description}>
            <code>
              <span className={styles.col_exe}>{contractsIdsMinted}</span>
            </code> total TRUSTY created
            <br/>
            <code>Factory address: {FACTORY_ADDRESS}</code>
            {/* <button className={styles.button1} onClick={(e)=>increaseV(vNum)}>
              <span>{` v${vNum}: `+FACTORY_ADDRESS+ ` ${version[vNum]}`}</span>
            </button> */}
          </div>

          <div className={styles.description}>
            Wallet: <code><span className={styles.col_dec}><Link href={network.name?.toLowerCase()==="polygon"?`https://polygonscan.com/address/${account}`:`https://etherscan.io/address/${account}`} target={`_blank`}>{account}</Link></span></code> <br />
            Balance: <strong><span className={styles.col_val}>{balance}</span></strong> {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"} <br />

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
            <div className={styles.description2 +" " +styles.trustylist}>
              <h3>Your Trusty <code><i>(Click and select on the multi-signature address you want to use)</i></code></h3>
              
              {TRUSTY_ADDRESS.map((item,i) => (
                    <p key={i} className={trustyID===item.id?styles.link_active2: styles.button1} onClick={()=>{setTrustyID(item.id)}}>
                      ID: <code>
                        <span className={styles.col_dec}>{item.id}</span>
                      </code> | Address: <span className={styles.col_data}>{item.address}</span> | Name: <span className={styles.col_data}>{item.name}</span>
                      
                    </p>
              ))}
            </div>
          )}

          {/* RENDER WHITELISTME */}
          {walletConnected && !whitelisted && renderWhitelistMe()}

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
          
          {loading && (
            <>
            <button className={styles.button}>Broadcasting, mining and validating your transaction... please wait [Loading: {JSON.stringify(loading)}]</button>
            </>
          )}

        </div>
      </div>

      <div className={styles.logo}>
        <Image className={styles.image} src="/logo.png" width={350} height={350} alt="img" priority/>
        
        <span>Trusty Factory Address: </span><br/>
        <code className={styles.col_data}>
          <Link target="_blank" href={
            network.name?.toLowerCase()==='mainnet' ? 
            `https://etherscan.io/address/${FACTORY_ADDRESS}` : 
            network.name?.toLowerCase()==='polygon' ? 
            `https://polygonscan.com/address/${FACTORY_ADDRESS}` : 
            network.name?.toLowerCase()==='sepolia' ? 
            `https://sepolia.etherscan.io/address/${FACTORY_ADDRESS}` :
            ""
          }>{
            network.name?.toLowerCase()==='mainnet' ?
            `https://etherscan.io/address/${FACTORY_ADDRESS}` :
            network.name?.toLowerCase()==='polygon' ?
            `https://polygonscan.com/address/${FACTORY_ADDRESS}` :
            network.name?.toLowerCase()==='sepolia' ? 
            `https://sepolia.etherscan.io/address/${FACTORY_ADDRESS}` :
            ""
          }</Link>
        </code>
      </div>

      <br/>

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
