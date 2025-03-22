import styles from "../../../styles/Home.module.css";

const Admin = ({
    balanceFactory,
    network,
    withdraw,
    setTrustyPriceSet,
    trustyPriceSet,
    priceConfig,
    trustyPrice,
    trustyPriceEnable,
    priceEnabler,
    inputFactoryWhitelistValue,
    handleFactoryWhitelistChange,
    handleFactoryWhitelistAdd,
    clearFactoryWhitelistInput,
    factoryWhitelist,
    addAddressToFactoryWhitelist,
    removeAddressFromFactoryWhitelist,
    factoryMaxWhitelist,
    setFactoryMaxWhitelist,
    setMaxWhitelistFactory,
    maxWhitelisted,
    addressesWhitelisted,

    getProviderOrSigner,
    FACTORY_ADDRESS,
    FACTORY_ABI,

    setLoading,

    //withdraw
    getFactoryOwner,
    getDetails,

    // priceConfig
    setTotalTrusty, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, setContractsIdsMinted,

    // trustyPriceEnable
    notifica
}) => {


    return (
        <>
            <div className={styles.inputDiv}>
                <h3>FACTORY OWNER Panel</h3>
                Balance <code className={styles.col_val}>{balanceFactory}</code> {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"}
                <button onClick={()=>withdraw(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setLoading, getFactoryOwner, notifica)} className={styles.button1}>withdraw</button>
                <hr />
                <input
                    type="number"
                    placeholder='<set price of trusty in ether> example: 0.05'
                    min={0}
                    step="0.01"
                    onChange={(e) => setTrustyPriceSet(e.target.value || "0")}
                    className={styles.input}
                />        
                <button onClick={()=>priceConfig(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setTotalTrusty, trustyPriceSet, setLoading, getDetails, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica)} className={styles.button1}>Price Set Actual: [{trustyPrice}]</button>
                <button onClick={()=>trustyPriceEnable(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setLoading, getDetails, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica)} className={styles.button1}>Price Active : [{JSON.stringify(priceEnabler)}]</button>
                
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
        
                <hr/>
        
                <code>
                    <label>[Update list]:</label>
                    <ul>
                        {factoryWhitelist.map((item,i) => {
                            return (<li key={i}>[{i}] : {item}</li>)
                        })}
                    </ul>
                </code>
        
                <button className={styles.button1} onClick={()=>(addAddressToFactoryWhitelist(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setLoading, factoryWhitelist, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica))}>UPDATE Whitelist</button>
                <button className={styles.button1} onClick={()=>removeAddressFromFactoryWhitelist(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, setLoading, factoryWhitelist, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica)}>REMOVE from Whitelist</button>
                
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
        
                <button className={styles.button1} onClick={()=>setMaxWhitelistFactory(getProviderOrSigner, FACTORY_ADDRESS, FACTORY_ABI, factoryMaxWhitelist, setLoading, setTotalTrusty, setContractsIdsMinted, setTrustyPrice, setPriceEnabler, setMaxWhitelisted, setAddressesWhitelisted, notifica)}>Set Max Whitelisted</button>
        
                <code>
                    <label>[whitelistable]:</label>
                    <code className={styles.col_val}>{maxWhitelisted}</code>
                    <br/>
                    <label>[whitelisted]:</label>
                    <code className={styles.col_val}>{addressesWhitelisted}</code>
                </code>
            </div>
        </>
    );
}
 
export default Admin;