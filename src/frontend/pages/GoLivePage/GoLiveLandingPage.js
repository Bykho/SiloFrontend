


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GoLiveLandingPage.module.css';
import config from '../../config';
import GameOfLife from '../LoginPage/GameOfLife';

function GoLiveLanding() {
  const [accessKey, setAccessKey] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAccessKeyChange = (e) => setAccessKey(e.target.value);
  const handleEmail = (e) => setEmail(e.target.value);
  const handleFullName = (e) => setFullName(e.target.value);

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
        navigate('/SignUp');
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

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.centralContainer}>
        <div className={styles.container}>
          <h2 className={styles.subtitle}>Have An Access Key?</h2>
          {error && <p className={styles.errorText}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input 
                type="text" 
                value={accessKey} 
                onChange={handleAccessKeyChange} 
                placeholder="Enter Access Key"
                className={styles.inputText}
              />
            </div>
            <button type="submit" className={styles.button}>Enter Access Key</button>
          </form>
        </div>
        <div className={styles.container}>
          <h2 className={styles.subtitle}>No Key? Join The waitlist!</h2>
          <form onSubmit={handleWaitlistSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input 
                type="text" 
                value={email} 
                onChange={handleEmail} 
                placeholder="Email"
                className={styles.inputText}
              />
            </div>
            <div className={styles.inputContainer}>
              <input 
                type="text" 
                value={fullName} 
                onChange={handleFullName} 
                placeholder="Full Name"
                className={styles.inputText}
              />
            </div>
            <button type="submit" className={styles.button}>Submit</button>
          </form>
          {success && <p className={styles.successText}>{success}</p>}
        </div>
        <button onClick={() => window.history.back()} className={styles.backButton}>Back</button>
      </div>
    </div>
  );
}

export default GoLiveLanding;



