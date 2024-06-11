


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './GoLiveLandingPage.module.css'; // Import the CSS file

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
        setKeyFlag(true); // Set keyFlag to true if access key is valid
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
    <div>
        <div className={styles.container}>
            {!showAccessKeyForm ? (
                <div className={styles.buttonContainer}>
                    <a className={styles.button} onClick={toggleAccessForm}>Enter Access Key</a>
                </div>
            ) : (
                <>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={handleSubmit} className={styles.formInfoContainer}>
                        <div className={styles.inputContainer}>
                            <label>Access Key:</label>
                            <input type="text" value={accessKey} onChange={handleAccessKeyChange} />
                        </div>
                        <button type="submit" className={styles.submitButton}>Submit</button>
                    </form>
                </>
            )}
        </div>
        <div className={styles.waitlistText}>
            <p>Don't have an access key? Get on the waitlist</p>
        </div>
        <form onSubmit={handleWaitlistSubmit} className={styles.formInfoContainer}>
            <div className={styles.inputContainer}>
                <label className={styles.waitListFields}>Email:</label>
                <input type="text" value={email} onChange={handleEmail} />
                <label className={styles.waitListFields}>Full Name:</label>
                <input type="text" value={fullName} onChange={handleFullName} />
            </div>
            <button type="submit" className={styles.submitButton} style = {{marginBottom: '40px'}}>Submit</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <a href='/login' className={styles.button} style = {{fontSize: '12px'}}>Back</a>
        </div>
        {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
);
}

export default GoLiveLanding;



