import styles from "../../../styles/Home.module.css";

export default function Factory({FACTORY_ADDRESS, contractsIdsMinted}) {

    return (
        <>
            <div className={styles.description}>
                <code>
                    <span className={styles.col_exe}>{contractsIdsMinted}</span>
                </code> total TRUSTY created
                <br/>
                <code>Factory address: {FACTORY_ADDRESS}</code>
            </div>
        </>
    )
}
