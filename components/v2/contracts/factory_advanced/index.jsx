import { Contract, ethers } from "ethers";

import { FACTORY_ADVANCED_ABI } from "../../../../constants/v2";

const ethDecimals = 10 ** 18;

// FACTORY
export const getFactoryOwner = async (getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica) => {
  //console.log("[Factory method]: getFactoryOwner()")
  try {
    const provider = await getProviderOrSigner();
    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress();

    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, provider);
    const _owner = await contract.owner();

    if (FACTORY_ADDRESS != null && address.toLowerCase() === _owner.toLowerCase()) {
      setIsOwner(true);
      const factoryBalance = (Number(await provider.getBalance(FACTORY_ADDRESS)) / ethDecimals).toString();
      setBalanceFactory(factoryBalance);
    } else {
      setIsOwner(false);
    }
  } catch (err) {
    console.error(err.message);
    notifica(err.message.toString());
  }
};

export async function withdraw(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setLoading, getFactoryOwner, notifica) {
  //console.log("[Factory method]: withdraw()");
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const withdraw = await contract.withdraw();
    setLoading(true);
    await withdraw.wait();
    setLoading(false);
    notifica(`ADMIN withdraw success!`)
    getFactoryOwner(getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export async function getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) {
  //console.log("[Factory method]: getDetails()");
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
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

export async function priceConfig(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, trustyPriceSet, setLoading, getDetails, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) {
  //console.log("[Factory method]: priceConfig()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const priceConf = await contract.trustyPriceConfig(ethers.parseEther(trustyPriceSet));
    setLoading(true);
    // wait for the transaction to get mined
    await priceConf.wait();
    setLoading(false);
    await getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const trustyPriceEnable = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setLoading, getDetails, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) => {
  //console.log("[Factory method]: trustyPriceEnable()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const priceEnabler = await contract.trustyPriceEnable();
    setLoading(true);
    // wait for the transaction to get mined
    await priceEnabler.wait();
    setLoading(false);
    getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
    //setPriceEnabler(setPriceEnabler);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const addAddressToFactoryWhitelist = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setLoading, factoryWhitelist, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) => {
  //console.log("[Factory method]: addAddressToFactoryWhitelist()")
  try {
    if (factoryWhitelist.length === 0) {
      notifica("You have to insert at least one address")
      return
    }
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const addFactoryWhitelist = await contract.addToFactoryWhitelist(factoryWhitelist);
    setLoading(true);
    // wait for the transaction to get mined
    await addFactoryWhitelist.wait();
    setLoading(false);
    getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const removeAddressFromFactoryWhitelist = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setLoading, factoryWhitelist, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) => {
  //console.log("[Factory method]: removeAddressFromFactoryWhitelist()")
  try {
    if (factoryWhitelist.length === 0) {
      notifica("You have to insert at least one address")
      return
    }
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const removeFactoryWhitelist = await contract.removeFromFactoryWhitelist(factoryWhitelist);
    setLoading(true);
    // wait for the transaction to get mined
    await removeFactoryWhitelist.wait();
    setLoading(false);
    getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const setMaxWhitelistFactory = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, factoryMaxWhitelist, setLoading, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica) => {
  //console.log("[Factory method]: setMaxWhitelistFactory()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const setMaxConf = await contract.setMaxWhitelist(factoryMaxWhitelist);
    setLoading(true);
    // wait for the transaction to get mined
    await setMaxConf.wait();
    setLoading(false)
    getDetails(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica)
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const whitelistMe = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, setLoading, trustyPrice, setWhitelisted, checkWhitelisted, notifica) => {
  //console.log("[Factory method]: whitelistMe()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const tx = await contract.whitelistMe({
      value: ethers.parseEther(trustyPrice),
    });
    setLoading(true);
    // wait for the transaction to get mined
    await tx.wait();
    setLoading(false);
    checkWhitelisted(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, account, setWhitelisted, notifica);
    notifica("You have been successfully whitelisted... " + JSON.stringify(tx.hash));
  } catch (err) {
    console.error(err);
    notifica(err.message.toString());
  }
}

export const checkWhitelisted = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, account, setWhitelisted, notifica) => {
  //console.log("[Factory method]: checkWhitelisted()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const isWhitelisted = await contract.whitelistedAddresses(account);
    setWhitelisted(isWhitelisted);
  } catch (err) {
    setWhitelisted(false)
    console.error(err);
    notifica(err.message.toString());
  }
}

// CREATE
export const createTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, owner1, owner2, moreOwners, confirms, trustyName, priceEnabler, trustyPrice, setLoading, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica) => {
  //console.log("[Factory method]: createTrusty()")
  const array = []
  array.push(owner1);
  array.push(owner2);
  array.push(...moreOwners)
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);

    const tx = await contract.createContract(array, confirms, trustyName, {
      value: ethers.parseEther(priceEnabler ? trustyPrice : "0"),
    });
    setLoading(true);
    await tx.wait();
    setLoading(false);
    checkAll(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica);
    notifica("You successfully created a Trusty Wallet... " + JSON.stringify(tx.hash));
  } catch (err) {
    console.error(err);
    notifica(err.message.toString());
  }
};

export const checkAll = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, walletConnected, setContractsIdsMinted, setTRUSTY_ADDRESS, notifica) => {
  //console.log("[Factory method]: checkAll()")
  if (walletConnected) {
    try {
      let box = [];
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
      let total = Number(await contract.totalTrusty());
      //let hasOwner = false;
      for (let i = 0; i < total; i++) {
        try {
          const _imOwner = await contract.imOwner(i);
          const _contractAddr = await contract.contracts(i);
          const _name = await contract.trustyID(i);

          if (_imOwner == true) {
            box.push({ id: i, address: _contractAddr, name: _name });
          }
        } catch (err) {
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

// MANAGE
export const depositToTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, addEther, setLoading, checkTrustyId, tokens, network, TRUSTY_ADDRESS, trustyTokens, setTrustyBalance, notifica) => {
  //console.log("[Factory method]: depositToTrusty()")
  try {
    if (trustyID === null) {
      notifica("You have to select a Trusty!")
      return
    }
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const _contractAddr = await contract.depositContract(trustyID, ethers.parseEther(addEther), { value: ethers.parseEther(addEther), gasLimit: 300000 });
    setLoading(true);
    await _contractAddr.wait();
    setLoading(false);
    await checkTrustyId(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, tokens, network, TRUSTY_ADDRESS, trustyID, trustyTokens, setTrustyBalance);
  } catch (err) {
    console.log(err.message);
    notifica(err.message.toString());
  }
}

export const checkTrustyId = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, tokens, network, TRUSTY_ADDRESS, trustyID, trustyTokens, setTrustyBalance) => {
  //console.log("[Factory method]: checkTrustyId()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const genericErc20Abi = require('../../../../constants/erc20.json');

    const getTokens = [];
    if (tokens[network.name.toLowerCase()]) {
      tokens[network.name.toLowerCase()].forEach(async (token) => {
        const trustyAddr = TRUSTY_ADDRESS.filter(id => { if (id.id == trustyID) { return id.address } })[0].address
        const tokenContractAddress = token.address;
        const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer);

        const balance = (await contract.balanceOf(trustyAddr))

        if (balance > 0) {
          const decimals = tokens[network.name.toLowerCase()]?.find((el) => { if (el.address == tokenContractAddress) { return el.decimals } })?.decimals || 0
          getTokens.push(`${token.symbol}: ${balance / 10 ** decimals}`)
        }
      });
    }

    trustyTokens.current = getTokens;

    const balance = (Number(await contract.contractReadBalance(trustyID)) / ethDecimals).toString();
    setTrustyBalance(balance);
  } catch (error) {
    console.log(error.message)
  }
}

export const checkTrustyOwners = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, CONTRACT_ABI, TRUSTY_ADDRESS, trustyID, setThreshold, setTrustyOwners) => {
  //console.log("[Factory method]: checkTrustyOwners()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);

    const trustyAddr = TRUSTY_ADDRESS.find((el) => { if (el.id === trustyID) return el.address }).address
    if (!trustyAddr) {
      //console.log("No trustyAddr")
      return
    }
    const trusty = new Contract(trustyAddr, CONTRACT_ABI, signer);
    const minConfirmations = parseInt(await trusty.numConfirmationsRequired());
    setThreshold(minConfirmations);

    const owners = (await contract.contractReadOwners(trustyID)).toString();
    setTrustyOwners(owners);
  } catch (error) {
    console.log(error)
  }
}

export const submitTxTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, txTo, isCallToContract, encodeMethod, txData, txValue, setLoading, clearTxParameter, getTxTrusty, setTotalTx, setTRUSTY_TXS, notifica) => {
  //console.log("[Factory method]: submitTxTrusty()")
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
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    if (isCallToContract) {
      let obj = encodeMethod(txData);
      const tx = await contract.trustySubmit(trustyID, txTo, ethers.parseEther(txValue), obj.hex);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      clearTxParameter();
      getTxTrusty();
      notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
    } else {
      const tx = await contract.trustySubmit(trustyID, txTo, ethers.parseEther(txValue), ethers.getBytes(Buffer.from(txData)));
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, setTotalTx, setTRUSTY_TXS);
      notifica("You successfully proposed to submit a transaction from the Trusty Wallet... " + tx.hash);
    }
  } catch (err) {
    setLoading(false);
    console.log(err?.message);
    notifica(err?.message.toString());
    setLoading(false);
  }
}

export const getTxTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, setTotalTx, setTRUSTY_TXS) => {
  //console.log("[Factory method]: getTxTrusty()")
  if (trustyID != null) {
    try {
      let box = [];
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
      const txs = await contract.contractReadTxs(trustyID);

      setTotalTx(txs);

      for (let i = 0; i < txs; i++) {
        const gettxs = await contract.getTx(trustyID, i);
        box.push({
          id: i,
          to: gettxs[0],
          value: Number(gettxs[1]) / ethDecimals,
          data: gettxs[2], executed: gettxs[3],
          confirmations: Number(gettxs[4]),
          block: Number(gettxs[5]) ? Number(gettxs[5]) : "N/A",
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
export const confirmTxTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, id, setLoading, setTotalTx, setTRUSTY_TXS, notifica) => {
  //console.log("[Factory method]: confirmTxTrusty()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const txs = await contract.trustyConfirm(trustyID, id);
    setLoading(true);
    await txs.wait();
    setLoading(false);
    getTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, setTotalTx, setTRUSTY_TXS);
    notifica(`You confirmed the Trusty tx id ${id}...` + txs.hash);
  } catch (err) {
    setLoading(false);
    console.log(err.message);
    notifica(err.message.toString());
  }
}

// REVOKE TX
export const revokeTxTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, id, setLoading, setTotalTx, setTRUSTY_TXS, notifica) => {
  //console.log("[Factory method]: revokeTxTrusty()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const txs = await contract.trustyRevoke(trustyID, id);
    setLoading(true);
    await txs.wait();
    setLoading(false);
    getTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, setTotalTx, setTRUSTY_TXS);
    notifica(`You revoked Trusty tx id ${id}... ${txs.hash}`);
  } catch (err) {
    setLoading(false);
    console.log(err.message);
    notifica(err.message.toString());
  }
}

// EXECUTE TX
export const executeTxTrusty = async (getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, id, setLoading, setTotalTx, setTRUSTY_TXS, tokens, network, TRUSTY_ADDRESS, trustyTokens, setTrustyBalance, notifica) => {
  //console.log("[Factory method]: executeTxTrusty()")
  try {
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, signer);
    const txs = await contract.trustyExecute(trustyID, id, { gasLimit: 300000 });
    setLoading(true);
    await txs.wait();
    setLoading(false);
    checkTrustyId(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, tokens, network, TRUSTY_ADDRESS, trustyID, trustyTokens, setTrustyBalance)
    getTxTrusty(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ADVANCED_ABI, trustyID, setTotalTx, setTRUSTY_TXS);
    notifica(`You succesfully executed the Trusty tx id ${id}... ${txs.hash}`);
  } catch (err) {
    setLoading(false);
    console.log(err.message);
    notifica(err.message.toString());
  }
}
