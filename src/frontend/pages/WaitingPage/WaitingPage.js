import React from 'react'
import styles from  './WaitingPage.module.css'

const WaitingPage = () => {
  return (
    <div className={styles['waiting-page']}>
      <div className={styles['waiting-container']}>
        <h1 className={styles['waiting-title']}>Locked Feature</h1>
        <p className={styles['waiting-message']}>
          Please await acceptance for access.
        </p>
        <div className={styles['waiting-advice']}>
          <p className={styles['advice-text']}>
            Recruiters are watching! Get faster access by building a strong portfolio on the profile tab.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingPage
