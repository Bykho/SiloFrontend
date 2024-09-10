import React from 'react'
import styles from  './WaitingPage.module.css'

const WaitingPage = () => {
  return (
    <div className={styles['waiting-page']}>
      <div className={styles['waiting-container']}>
        <h1 className={styles['waiting-title']}>Profile Under Review.</h1>
        <p className={styles['waiting-message']}>
          Please await acceptance for access to this feature.
        </p>
        <div className={styles['waiting-advice']}>
          <p className={styles['advice-text']}>
            Recruiters are watching! Get faster access by building a strong portfolio on the profile tab.
          </p>
          <p style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '15px',
            fontStyle: 'italic',
          }}>
            Message dan@silorepo.com or nb3227@columbia.edu for questions
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingPage
