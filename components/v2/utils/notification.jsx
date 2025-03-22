import styles from "../../../styles/Home.module.css";

export default function Notification({notification, clear}) {
    return (
        <>
            {notification != null && (
                <div className={styles.notification}>
                    <button onClick={clear}>x</button>
                    <code className={styles.col_dec}>[LOG]</code>: <code>{notification}</code>
                </div>
            )}
        </>
    )
}