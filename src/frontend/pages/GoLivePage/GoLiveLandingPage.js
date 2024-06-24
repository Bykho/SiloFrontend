import React, { useState } from 'react';
import styles from './GoLiveLandingPage.module.css';
import config from '../../config';

function GoLiveLanding({ setKeyFlag }) {
  const [accessKey, setAccessKey] = useState('');
  const [showAccessKeyForm, setShowAccessKeyForm] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleEmail = (e) => setEmail(e.target.value);
  const handleFullName = (e) => setFullName(e.target.value);
  const handleAccessKeyChange = (e) => setAccessKey(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/checkAccessKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_key: accessKey }),
      });

      if (response.ok) {
        setKeyFlag(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid access key');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${config.apiBaseUrl}/joinWaitingList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, full_name: fullName })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Successfully added to waitlist');
        setEmail('');
        setFullName('');
      } else {
        setError(data.error || 'Failed to add to waitlist');
      }
    } catch (error) {
      setError(error.message || 'Failed to add to waitlist');
    }
  };

  const toggleAccessForm = () => setShowAccessKeyForm(!showAccessKeyForm);

  return (
    <div className={styles.centralContainer}>
      <div className={styles.container}>
        <h2>Have an Access Key?</h2>
        {!showAccessKeyForm ? (
          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={toggleAccessForm}>Enter Access Key</button>
          </div>
        ) : (
          <>
            {error && <p className={styles.errorText}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputContainer}>
                <label htmlFor="accessKey">Access Key:</label>
                <input type="text" id="accessKey" value={accessKey} onChange={handleAccessKeyChange} />
              </div>
              <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
          </>
        )}
      </div>
      <div className={styles.container}>
        <p>Don't have an access key? Get on the waitlist</p>
        <form onSubmit={handleWaitlistSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={handleEmail} />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="fullName">Full Name:</label>
            <input type="text" id="fullName" value={fullName} onChange={handleFullName} />
          </div>
          <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
        {success && <p className={styles.successText}>{success}</p>}
      </div>
      <div className={styles.backButtonContainer}>
        <a href='/login' className={styles.backButton}>Back</a>
      </div>
    </div>
  );
}

export default GoLiveLanding;
