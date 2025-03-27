/**
 * TRUSTY-dApp v0.2.0
 * Copyright (c) 2024 Ramzi Bougammoura
 */

import { Contract, ethers } from "ethers";
import Head from "next/head";
//import Image from "next/image";
//import Link from "next/link";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useTheme } from 'next-themes';

import { FACTORY_ABI, FACTORY_ADVANCED_ABI, CONTRACT_ABI, CONTRACT_ADVANCED_ABI, CONTRACT_RECOVERY_ABI } from "../../constants/v2";

import { networks } from "../../constants/v2/networks";
import { tokens } from "../../constants/v2/tokens";
import { actions } from "../../constants/v2/actions";

import { encodeMethod, encodeCalldata, hex2string } from "../../components/v2/utils";
import { decodeCalldata } from "../../components/calldata";

import styles from "../../styles/Home.module.css";

import {
  getFactoryOwner,
  getDetails,
  withdraw,
  priceConfig,
  trustyPriceEnable,
  addAddressToFactoryWhitelist,
  removeAddressFromFactoryWhitelist,
  setMaxWhitelistFactory,
  whitelistMe,
  checkWhitelisted,
  createTrusty,
  checkAll,
  depositToTrusty,
  checkTrustyId,
  checkTrustyOwners,
  submitTxTrusty,
  getTxTrusty,
  confirmTxTrusty,
  revokeTxTrusty,
  executeTxTrusty
} from "../../components/v2/contracts/factory";

import Wallet from "../../components/v2/wallet"
import Connect from "../../components/v2/wallet/connect";
import Factory from "../../components/v2/factory";
import Network from "../../components/v2/network";
import Navbar from "../../components/v2/navbar";
import Footer from "../../components/v2/footer";

import Notification from "../../components/v2/utils/notification";

//import {notifica, clear} from "../../components/v2/utils";

import Admin from "../../components/v2/factory/admin";

const ethDecimals = 10 ** 18;

const getNetworkState = true;

export default function Home() {
  const { theme, setTheme } = useTheme();
  // WALLET
  const [walletConnected, setWalletConnected] = useState(false);
  const [network, setNetwork] = useState({});

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);

  const gas = useRef(0);
  const block = useRef(0);

  // FACTORY details
  const [factoryType, setFactoryType] = useState("Factory")
  const [FACTORY_ADDRESS, setFACTORY_ADDRESS] = useState("");
  const [contractsIdsMinted, setContractsIdsMinted] = useState(0);

  const [isOwner, setIsOwner] = useState(false);
  const [balanceFactory, setBalanceFactory] = useState(0);

  const [trustyPrice, setTrustyPrice] = useState(0);
  const [trustyPriceSet, setTrustyPriceSet] = useState("0");
  const [priceEnabler, setPriceEnabler] = useState();

  const [factoryWhitelist, setFactoryWhitelist] = useState([]);
  const [factoryMaxWhitelist, setFactoryMaxWhitelist] = useState(100);
  const [maxWhitelisted, setMaxWhitelisted] = useState(0);
  const [addressesWhitelisted, setAddressesWhitelisted] = useState(0);

  const [inputFactoryWhitelistValue, setInputFactoryWhitelistValue] = useState('');

  const [totalTrusty, setTotalTrusty] = useState(0);

  const [whitelisted, setWhitelisted] = useState(false);

  const [TRUSTY_ADDRESS, setTRUSTY_ADDRESS] = useState([]);

  // TRUSTY create
  const [trustyID, setTrustyID] = useState(null);
  const [owner1, setOwner1] = useState();
  const [owner2, setOwner2] = useState();
  const [moreOwners, setMoreOwners] = useState([]);

  const [confirms, setConfirms] = useState(1);
  const [trustyName, setTrustyName] = useState("");

  const [addMoreOwners, setAddMoreOwners] = useState(false);
  const countOwners = useRef(0);
  const [inputOwnersValue, setInputOwnersValue] = useState('');

  // TRUSTY Details
  const [trustyOwners, setTrustyOwners] = useState();
  const [threshold, setThreshold] = useState(0)
  const [trustyBalance, setTrustyBalance] = useState(0);
  const trustyTokens = useRef([])

  const zero = BigInt(0);
  const [addEther, setAddEther] = useState(zero);

  // TX create
  const [isCallToContract, setIsCallToContract] = useState(false);
  const [txValue, setTxValue] = useState("0");
  const [advanced, setAdvanced] = useState(false);
  const [txData, setTxData] = useState("0");
  const [txTo, setTxTo] = useState("");

  const [totalTx, setTotalTx] = useState(0);
  const [TRUSTY_TXS, setTRUSTY_TXS] = useState([]);
  const [_debug, setDebug] = useState(false);

  const [selector, setSelector] = useState("");
  const [paramtype1, setParamType1] = useState("");
  const [paramtype2, setParamType2] = useState("");

  // TXS
  const [toggleExecuted, setToggleExecuted] = useState(false);

  // MENU
  const [dashboard, setDashboard] = useState(true);
  const [create, setCreate] = useState(false);
  const [manage, setManage] = useState(false);
  const [TXS, setTXS] = useState(false);
  const [submit, setSubmit] = useState(false);

  // STATES
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState();

  const ThemeToggle = () => {
    return (
      <div className={styles.theme}>
        <button className={styles.btn} onClick={() => setTheme('light')}>Light</button>
        <button className={styles.btn} onClick={() => setTheme('dark')}>Dark</button>
      </div>
    );
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    let provider;

    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum)
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const chainId = parseInt((await provider.getNetwork()).chainId);

        for (let i of Object.keys(networks)) {
          let id = networks[i]
          /*
          if (factoryType === 'Factory Advanced') {
            if (id.id === chainId && id.advanced !== "" && !walletConnected) {
              console.log("Selected Factory Advanced")
              setWalletConnected(true);
              setNetwork({ id: chainId, name: id.name, contract: id.advanced })
              setFACTORY_ADDRESS(id.advanced)
              break
            }
          } else {
            if (id.id === chainId && id.contract !== "" && !walletConnected) {
              console.log("Selected Factory")
              setWalletConnected(true);
              setNetwork({ id: chainId, name: id.name, contract: id.contract })
              setFACTORY_ADDRESS(id.contract)
              break
            }
          }
          */
          if (id.id === chainId && id.contract !== "" && !walletConnected) {
            setWalletConnected(true);
            setNetwork({ id: chainId, name: id.name, contract: id.contract })
            setFACTORY_ADDRESS(id.contract)
            break
          }
        }
      } catch (error) {
        console.log(error)
      }
    } else if (window.web3) {
      provider = new ethers.BrowserProvider(window.web3.currentProvider)
    } else {
      console.log("You have to install a web3 wallet")
    }

    if (needSigner) {
      const signer = await provider.getSigner();
      setAccount(signer.address);
      setOwner1(signer.address);
      const balance = Number(await provider.getBalance(signer.address))
      setBalance((balance / ethDecimals).toFixed(8));
      return signer;
    }
    return provider;
  };

  const switchNetwork = async (id = network.id) => {
    if (window.ethereum) {
      try {
        // Try to switch the network
        let res = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + id.toString(16) }],
        });
      } catch (err) {
        notifica(err.message)
      }
    }
  }

  const checkNetwork = (chainId) => {
    for (let i of Object.keys(networks)) {
      let id = networks[i]
      if (id.id === chainId && id.contract !== "") {
        setWalletConnected(true);
        //setFACTORY_ADDRESS(id.contract)
        setNetwork({ id: chainId, name: id.name })
        return true
      }
    }
    return false
  }

  const getGasAndBlock = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      block.current = await provider.getBlockNumber();
      const gasPrice = await provider.getFeeData(); // gasPrice | maxFeePerGas | maxPriorityFeePerGas
      const gasPriceAdj = gasPrice.gasPrice
      const gasAdjusted = ethers.formatUnits(gasPriceAdj, 'gwei') // gwei | wei

      gas.current = Number(gasAdjusted).toFixed(3)
    } catch (error) {
      //console.log(error)
    }
  }

  async function notifica(msg) {
    setNotification(msg.toString());
    setTimeout(() => { clear() }, 15000);
  }

  function clear() {
    setNotification(null);
  }

  function clearTxParameter() {
    setTxTo("");
    setTxValue("0");
    setTxData("0");
    setSelector("");
    setParamType1("");
    setParamType2("");
  }

  // GAS and BLOCK
  useEffect(() => {
    if (getNetworkState) {
      //console.log("[Effect]: getGasAndBlock()")
      getGasAndBlock()
    }
  }, []);

  // ACCOUNT CONNECTED
  useEffect(() => {
    setTrustyID(null);
    setTRUSTY_ADDRESS([])
    setTRUSTY_TXS([])
    //clearState()      
    try {
      if (window.ethereum && !walletConnected) {
        //console.log("[Effect]: connectWallet()")
        connectWallet();
      } else if (window.ethereum) {
        //console.log("[Effect]: getProviderOrSigner()")
        getProviderOrSigner(true);
        checkAll(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica);
        checkWhitelisted(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, account, setWhitelisted, notifica)
        // setInterval(() => {
        //   console.log("[Effect]: getProviderOrSigner interval")
        //   getProviderOrSigner(true);              
        //   if (trustyID != null) {
        //     //getTxTrusty();
        //   }
        // }, 15 * 1000);
      }
    } catch (err) {
      console.log("[ERROR]:", err)
      notifica(err.message.toString());
    }
  }, [account]);

  useEffect(() => {
    //clearState()
    if (walletConnected) {
      //console.log("[Effect]: getFactoryOwner() and getDetails()")
      try {
        getFactoryOwner(getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica);
        getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
      } catch (err) {
        console.log("[ERROR]:", err)
        notifica(err.message.toString());
      }
    }
  }, [account]);

  useEffect(() => {
    //setTrustyID(null);
    //setTRUSTY_ADDRESS([])
    //setTRUSTY_TXS([])
    //setContractsIdsMinted(0)
    //setFACTORY_ADDRESS("")
    //clearState()   
    try {
      if (window.ethereum && walletConnected) {
        //console.log("[FACTORY TYPE]:", factoryType)
        setWalletConnected(false)
        //connectWallet()
        //getProviderOrSigner(true);
        //setWalletConnected(true)
        //checkAll(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica);
        //checkWhitelisted(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, account, setWhitelisted, notifica)
        //getFactoryOwner(getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica);
        //getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
        //console.log("[FACTORY ADDRESS]: ", FACTORY_ADDRESS)
        //console.log(network)
      }
    } catch (error) {
      console.log(error)
    }
  }, [factoryType])

  // Trusty Selected
  useEffect(() => {
    //clearState();
    //setTrustyWhitelist([]);
    try {
      if (trustyID != null && walletConnected) {
        //console.log("[EFFECT]: checkAll(), checkTrustyId(), getTxTrusty(), checkTrustyOwners()")
        checkAll(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica);
        checkTrustyId(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, tokens, network, TRUSTY_ADDRESS, trustyID, trustyTokens, setTrustyBalance);
        getTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, setTotalTx, setTRUSTY_TXS);
        checkTrustyOwners(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, CONTRACT_ABI, TRUSTY_ADDRESS, trustyID, setThreshold, setTrustyOwners);
      }
    } catch (err) {
      console.log(err.message);
      notifica(err.message.toString());
    }
  }, [account, trustyID]);

  // Handle Account change
  useEffect(() => {
    //console.log("[Effect]: Handle account chainChanged")
    //if(account!=account){handleChainChanged()}  
  }, [account]);

  // Handle Network change  
  useEffect(() => {
    if (network.name !== null && walletConnected) {
      //console.log("Network trigger", network.name)
      //console.log("[Effect]: network.name")
      //setFACTORY_ADDRESS(null)
      //setTRUSTY_ADDRESS([])
      setTrustyID(null);
      //setTRUSTY_TXS([])
      //setTotalTx(0)

      checkNetwork()

      //checkAll();
      getFactoryOwner(getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica);
      //getDetails();  
    }
  }, [network.name])

  // ACCOUNT and NETWORK listener
  useEffect(() => {
    if (window.ethereum && walletConnected) {
      //console.log("[Effect]: chainChanged and accountsChangex")
      window.ethereum.on('chainChanged', () => {
        handleChainChanged()
      })
      window.ethereum.on('accountsChanged', () => {
        handleChainChanged()
      })
    }
  }, [account])

  // Network
  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  // Handlers
  const handleOwnersAdd = (e) => {
    if (inputOwnersValue !== "" && ethers.isAddress(inputOwnersValue)) {
      e.preventDefault();
      setMoreOwners([...moreOwners, inputOwnersValue]);
      countOwners.current++;
      setInputOwnersValue("");
    } else { notifica(`You must specify a valid owner to add!`) }
  }

  const clearOwnersInput = () => {
    countOwners.current = 0;
    setMoreOwners([]);
    setInputOwnersValue("");
    console.log(`clear ... [${confirms + countOwners.current}]`, moreOwners);
  }

  const handleOwnersChange = (e) => { setInputOwnersValue(e.target.value); }


  const handleFactoryWhitelistChange = (e) => { setInputFactoryWhitelistValue(e.target.value) }

  const handleFactoryWhitelistAdd = (e) => {
    if (inputFactoryWhitelistValue !== "" && ethers.isAddress(inputFactoryWhitelistValue)) {
      e.preventDefault();
      setFactoryWhitelist([...factoryWhitelist, inputFactoryWhitelistValue]);
      setInputFactoryWhitelistValue("");
    } else { notifica(`You must specify a valid address to whitelist!`) }
  }

  const clearFactoryWhitelistInput = () => {
    setFactoryWhitelist([]);
    setInputFactoryWhitelistValue("");
    console.log(`clearing whitelist ... [Factory Whitelist]`, factoryWhitelist);
  }

  // Renders
  const renderWhitelistMe = () => {
    if (walletConnected && !whitelisted) {
      return (
        <div className={styles.inputDiv}>
          <button className={styles.button} onClick={() => whitelistMe(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setLoading, trustyPrice, setWhitelisted, checkWhitelisted, notifica)}>
            WhitelistMe
          </button>
          {trustyPrice} ETH
        </div>
      );
    }
  }

  const renderCreateTrusty = () => {
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
          <hr />
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

          <hr />

          <label>more Owners? [<span className={styles.col_exe}>{JSON.stringify(addMoreOwners)}</span>]</label>
          <input className={styles.checkbox} type="checkbox" checked={addMoreOwners} onChange={() => { setAddMoreOwners(!addMoreOwners) }} />

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

              {moreOwners.map((item, i) => {
                return (
                  <li key={i}>{item}</li>
                )
              })}
            </div>
          )}

          <hr />

          <label>Minimum Threshold Confirmations:</label>
          <input
            type="number"
            placeholder="1"
            min="1"
            max={1 + countOwners.current}
            onChange={(e) => setConfirms(e.target.value || "1")}
            className={styles.input}
          />
          {renderCreateTrustyButton()}
        </div>
      );
    }
  };

  const renderCreateTrustyButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={() => { connectWallet() }} className={styles.button}>
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
          <button className={styles.button} onClick={() => createTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, owner1, owner2, moreOwners, confirms, trustyName, priceEnabler, trustyPrice, setLoading, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica)}>
            Create a Trusty
          </button>
          {priceEnabler ? trustyPrice : "0"} {network.name?.toLowerCase() === "polygon" ? "MATIC" : "ETH"}
        </div>
      );
    }
  };

  const renderManageTrusty = () => {
    return (
      <div id="manage" className={styles.inputDiv}>
        <legend><h3>Manage your Trusty</h3></legend>
        <hr />

        <p>ID: <span className={styles.col_exe}>{trustyID}</span></p>

        <p>Name: <code className={styles.col_data}>{TRUSTY_ADDRESS.map(id => { if (id.id == trustyID) { return id.name } })}</code></p>

        <label>Selected: <span className={styles.col_exe}>{TRUSTY_ADDRESS.map(id => { if (id.id == trustyID) { return id.address } })}</span></label>

        <br />
        
        <code>Owners:</code>
        <ul>
          {trustyOwners.length > 0 && trustyOwners.map((item,i) => {
            return (<li key={i}>[{i}] : {item}</li>)
          })}
        </ul>

        <p>Threshold: <span className={styles.col_exe}>{threshold}</span></p>

        <p>Balance: <span className={styles.col_val}>{trustyBalance}</span> {network.name?.toLowerCase() === "polygon" ? "MATIC" : "ETH"}</p>

        {trustyTokens.current != [] && trustyTokens.current.map((token, i) => {
          return <p key={i}><code className={styles.col_dec} key={token}>{token}</code></p>
        })}

        <label>Amount to deposit:</label>
        <input
          type="number"
          placeholder="<Amount> example: 0.10"
          min={0}
          step="0.01"
          onChange={(e) => setAddEther(e.target.value || "0")}
          className={styles.input}
        />
        <button onClick={() => depositToTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, addEther, setLoading, checkTrustyId, tokens, network, TRUSTY_ADDRESS, trustyTokens, setTrustyBalance, notifica)} className={styles.button}>Deposit to Trusty {trustyID}</button>
      </div>
    )
  };

  const renderCreateTx = () => {
    return (
      <div id="submit" className={styles.inputDiv}>
        <legend><h3>Submit a Trusty transaction proposal</h3></legend><br />
        <hr />
        <label>TX To (Receiver Address or Contract to interact):</label><br />

        {isCallToContract ?
          <>
            <select className={styles.select} onChange={(e) => { setTxTo(e.target.value || "0x0"); setTxValue(txValue || "0"); }}>
              <option label="Select a contract:" defaultValue={`Select a contract`}>Select an ERC20 Token or a contract to interact with or insert its address in the following field:</option>

              {tokens[network.name.toLowerCase()]?.length > 0 && tokens[network.name.toLowerCase()]?.map((item, i) => {
                return (<option key={i} value={item.address}>Symbol: {item.symbol} Decimals: {item.decimals} Address: {item.address}</option>)
              })}
            </select>
            <br />

            {advanced ?
              <input
                type="text"
                value={txTo}
                placeholder='contract address to interact with'
                onChange={(e) => { setTxTo(e.target.value || "0x0") }}
                className={styles.input}
              />
              :
              <input
                type="text"
                value={txTo}
                placeholder='contract address to interact with'
                onChange={(e) => { setTxTo(e.target.value || "0x0") }}
                className={styles.input}
                disabled
              />
            }

            <br /><br />
          </>
          :
          <>
            <input
              type="text"
              placeholder='to'
              onChange={(e) => setTxTo(e.target.value || "0x0")}
              className={styles.input}
            /><br /><br />
          </>
        }

        <label>TX Value ({network.name?.toLowerCase() === "polygon" ? "MATIC" : "ETH"} to transfer):</label>
        {isCallToContract ?
          <>
            <input
              type="number"
              placeholder='eth value'
              min={0}
              value={txValue || "0"}
              step="0.01"
              onChange={(e) => setTxValue(e.target.value || "0")}
              className={styles.input}
            /><br /><br />
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
            /><br /><br />
          </>
        }

        <label>TX Data (*Optional Message Data or Contract Calldata serialized and encoded):</label>

        {isCallToContract && (
          <>
            <input
              type="text"
              placeholder="Insert the address receiver"
              className={styles.input}
              value={paramtype1}
              onChange={(e) => {
                setParamType1(e.target.value);
              }
              } />

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
              } />

            <select className={styles.select} onChangeCapture={(e) => { setSelector(e.target.value || "0") }}>
              <option label="Select an action:" defaultValue={`Select an action`}>Select an action:</option>

              {actions.map((item, i) => {
                return (<option key={i} value={item.calldata}>{item.type} : {item.calldata} - {item.description}</option>)
              })}
            </select>
            <button className={styles.button1} onClick={() => { encodeCalldata(tokens, network, txTo, setTxData, selector, paramtype1, paramtype2) }}>encode</button>
            <br /><br />
          </>
        )}

        {advanced ?
          <>
            <input
              type="text"
              placeholder={isCallToContract ? '`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`' : ''}
              value={txData !== "0" ? txData : isCallToContract ? "0" : ""}
              onChange={(e) => setTxData(e.target.value || "0")}
              className={styles.input}
            /><br />
          </>
          :
          <>
            <input
              type="text"
              placeholder={isCallToContract ? '`confirmTransaction(uint256)0` or `transfer(address,uint256)0xabcdef123456,1000000000000000000`' : ''}
              value={txData !== "0" ? txData : isCallToContract ? "0" : ""}
              onChange={(e) => setTxData(e.target.value || "0")}
              className={styles.input}
              disabled
            /><br />
          </>
        }

        <br />

        <label><b>calldata</b> [<code className={styles.col_exe}>{JSON.stringify(isCallToContract)}</code>]</label>
        <input className={styles.checkbox} type="checkbox" checked={isCallToContract} onChange={() => setIsCallToContract(!isCallToContract)} checked={isCallToContract} /><br />

        <code>* Check this if you need to encode a call to a contract </code>
        <br />
        <code>** ERC20 transfer calldata example: `approve(address,uint256)0xabcdef123456,1000000000000000000` and then `transfer(address,uint256)0xabcdef123456,1000000000000000000` </code>
        <br />

        {true && (
          <><br />
            <label><b>advanced</b> [<code className={styles.col_exe}>{JSON.stringify(advanced)}</code>]</label>
            <input className={styles.checkbox} type="checkbox" checked={advanced} onChange={() => setAdvanced(!advanced)} checked={advanced} /><br />
            <code>* Check this if you need to edit the `TO` and `DATA` fields</code>
            <br />
          </>
        )}

        <br />

        <div className={styles.inputDiv}>
          <h3>Preview</h3>
          <p>to: {txTo}</p>
          <p>value: {txValue.toString()} {network.name?.toLowerCase() === "polygon" ? "MATIC" : "ETH"}</p>
          <p>data: {txData} </p>

          {isCallToContract && (
            <>
              <p>data serialized: {txData != null && encodeMethod(txData || "0").hex.toString()}</p>
              <p>calldata decoded: {txData != null && decodeCalldata(encodeMethod(txData || "0")?.hex.toString())}</p>
            </>
          )}
          <button onClick={() => submitTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, txTo, isCallToContract, encodeMethod, txData, txValue, setLoading, clearTxParameter, getTxTrusty, setTotalTx, setTRUSTY_TXS, notifica)} className={styles.button}>Submit</button>

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

  const renderTx = () => {
    if (loading) {
      return <button className={styles.button}>Loading transactions...</button>;
    }
    return (
      <div className={styles.inputDiv}>
        <h3>Transactions</h3>
        <hr />
        Total TXs: {totalTx.toString()} <br />

        <label><i>filter executed</i> [<code className={styles.col_exe}>{JSON.stringify(toggleExecuted)}</code>]</label>
        <input type="checkbox" onChange={() => setToggleExecuted(!toggleExecuted)} />
        <hr />
        <div className={styles.txs}>

          {!toggleExecuted && TRUSTY_TXS.map((item, i) => (
            (
              <span key={i} className={styles.tx}>
                <p>id: {item.id}</p>
                <p>To: {item.to.toString()}</p>
                <p>Value: <span className={styles.col_val}>{item.value.toString()} {network.name?.toLowerCase() === "polygon" ? "MATIC" : "ETH"}</span></p>
                <p>Data Raw: <span className={styles.col_data}>{item.data.toString()}</span></p>
                <p>Data Message: <span className={styles.col_dec}>{hex2string(item.data)}</span></p>
                <p>Calldata: <span className={styles.col_dec}>{decodeCalldata(item.data)}</span></p>
                <p>Executed: <code className={styles.col_exe}>{item.executed.toString()}</code></p>
                <p>Confirmations: {item.confirmations.toString()}</p>
                <p>Block: {item.block ? item.block.toString() : "N/A"}</p>
                {/* <p>Timelock: {item.timelock?item.timelock.toString():"N/A"}</p> */}
                <p>Timestamp: {item.timestamp ? new Date(item?.timestamp * 1000).toLocaleString() : "N/A"}</p>

                {!item.executed == true && (
                  <div>
                    <button onClick={() => { confirmTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, item.id, setLoading, setTotalTx, setTRUSTY_TXS, notifica) }} className={styles.button1}>confirm</button>
                    <button onClick={() => { revokeTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, item.id, setLoading, setTotalTx, setTRUSTY_TXS, notifica) }} className={styles.button2}>revoke</button>
                    <button onClick={() => { executeTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, trustyID, item.id, setLoading, setTotalTx, setTRUSTY_TXS, tokens, network, TRUSTY_ADDRESS, trustyTokens, setTrustyBalance, notifica) }} className={styles.button3}>execute</button>

                  </div>
                )}
              </span>
            )
          ))}

          {toggleExecuted && TRUSTY_TXS.map((item, i) => (
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
                <p>Block: {item.block ? item.block.toString() : "N/A"}</p>
                <p>Timelock: {item.timelock ? item.timelock.toString() : "N/A"}</p>
                <p>Timestamp: {item.timestamp ? new Date(item?.timestamp * 1000).toLocaleString() : "N/A"}</p>

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
        <title>Trusty v2</title>
        <meta name="description" content="Trusty-dApp, a generator-manager for vaults and multisignatures contracts wallets accounts 2/3 or 3/3..." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className={styles.main}>
        <div>
          {/* THEME */}
          {ThemeToggle()}

          {/* NOTIFICATIONS */}
          <Notification
            notification={notification}
            clear={clear}
          />

          {/* NETWORK */}
          {network.name !== null && (
            <Network
              getFactoryOwner={getFactoryOwner}
              getProviderOrSigner={getProviderOrSigner}
              FACTORY_ADDRESS={FACTORY_ADDRESS}
              switchNetwork={switchNetwork}
              network={network}
              setIsOwner={setIsOwner}
              setBalanceFactory={setBalanceFactory}
              notifica={notifica}
            />
          )}

          {/* <select className={styles.select} defaultValue={"Select the type of Factory:"} onChange={(e) => { setFactoryType(e.target.value || "Factory") }}>
            <option value={"Factory"}>Factory</option>
            <option value={"Factory Advanced"}>Factory Advanced</option>
          </select> */}

          {/* {factoryType} */}

          {/* CONNECT */}
          {!walletConnected && (
            <Connect connectWallet={connectWallet} />
          )}

          {walletConnected && network.name !== null && dashboard && (
            <>
              {/* FACTORY DETAILS */}
              <Factory
                FACTORY_ADDRESS={FACTORY_ADDRESS}
                contractsIdsMinted={contractsIdsMinted}
              />

              {/* WALLET ACCOUNT */}
              <Wallet
                network={network}
                account={account}
                balance={balance}
                getNetworkState={getNetworkState}
                block={block}
                gas={gas}
              />

              {/* FACTORY ADMIN */}
              {isOwner &&
                <Admin
                  balanceFactory={balanceFactory}
                  network={network}
                  withdraw={withdraw}
                  setTrustyPriceSet={setTrustyPriceSet}
                  trustyPriceSet={trustyPriceSet}
                  priceConfig={priceConfig}
                  trustyPrice={trustyPrice}
                  trustyPriceEnable={trustyPriceEnable}
                  priceEnabler={priceEnabler}
                  inputFactoryWhitelistValue={inputFactoryWhitelistValue}
                  handleFactoryWhitelistChange={handleFactoryWhitelistChange}
                  handleFactoryWhitelistAdd={handleFactoryWhitelistAdd}
                  clearFactoryWhitelistInput={clearFactoryWhitelistInput}
                  factoryWhitelist={factoryWhitelist}
                  addAddressToFactoryWhitelist={addAddressToFactoryWhitelist}
                  removeAddressFromFactoryWhitelist={removeAddressFromFactoryWhitelist}
                  factoryMaxWhitelist={factoryMaxWhitelist}
                  setFactoryMaxWhitelist={setFactoryMaxWhitelist}
                  setMaxWhitelistFactory={setMaxWhitelistFactory}
                  maxWhitelisted={maxWhitelisted}
                  addressesWhitelisted={addressesWhitelisted}

                  getProviderOrSigner={getProviderOrSigner}
                  FACTORY_ADDRESS={FACTORY_ADDRESS}
                  FACTORY_ABI={FACTORY_ABI}

                  setLoading={setLoading}
                  getFactoryOwner={getFactoryOwner}
                  getDetails={getDetails}

                  setTrustyPrice={setTrustyPrice}
                  setPriceEnabler={setPriceEnabler}
                  setMaxWhitelisted={setMaxWhitelisted}
                  setAddressesWhitelisted={setAddressesWhitelisted}

                  setTotalTrusty={setTotalTrusty}

                  setWhiteliste={setWhitelisted}

                  notifica={notifica}
                />}
            </>
          )}

          {/* TRUSTIES DETAILS */}
          {dashboard && walletConnected && (
            <div className={styles.description2 + " " + styles.trustylist}>
              <h3>Your Trusty <code><i>(Click and select on the multi-signature address you want to use)</i></code></h3>

              {TRUSTY_ADDRESS.map((item, i) => (
                <p key={i} className={trustyID === item.id ? styles.link_active2 : styles.button1} onClick={() => { setTrustyID(item.id) }}>
                  ID: <code>
                    <span className={styles.col_dec}>{item.id}</span>
                  </code> | Address: <span className={styles.col_data}>{item.address}</span> | Name: <span className={styles.col_data}>{item.name}</span>

                </p>
              ))}
            </div>
          )}

          {/* RENDER WHITELISTME */}
          {walletConnected && !whitelisted && renderWhitelistMe()}

          {walletConnected && 
          <div className={styles.menu}>
            <label className={styles.menu_label}>Create <input className={styles.checkbox} type="checkbox" checked={create} onChange={() => setCreate(!create)} /></label>
            <label className={styles.menu_label}>Manage <input className={styles.checkbox} type="checkbox" checked={manage} onChange={() => setManage(!manage)} /></label>
            <label className={styles.menu_label}>Create Tx <input className={styles.checkbox} type="checkbox" checked={submit} onChange={() => setSubmit(!submit)} /></label>
            <label className={styles.menu_label}>Get Txs <input className={styles.checkbox} type="checkbox" checked={TXS} onChange={() => setTXS(!TXS)} /></label>
          </div>
          }

          {/* RENDER CREATE TRUSTY */}
          {create && walletConnected && !loading && renderCreateTrusty()}

          {/* RENDER MANAGE TRUSTY ACTION */}
          {manage && walletConnected && TRUSTY_ADDRESS.length > 0 && !loading && renderManageTrusty()}

          {/* CREATE TRUSTY TX */}
          {submit && walletConnected && TRUSTY_ADDRESS.length > 0 && !loading && renderCreateTx()}

          {/* GET TRUSTY TX */}
          {TXS && walletConnected && TRUSTY_ADDRESS.length > 0 && trustyID !== null && renderTx()}

          {/*loading && (
            <Suspense>
              <div className={styles.loading}>Loading... please wait [Loading: {JSON.stringify(loading)}]</div>
            </Suspense>
          )*/}
        </div>
      </div>

      <Footer
        FACTORY_ADDRESS={FACTORY_ADDRESS}
        network={network}
      />
    </div>
  )
}
