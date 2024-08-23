import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GoLiveLandingPage.module.css';
import config from '../../config';
import GameOfLife from '../LoginPage/GameOfLife';
import { IoEnter } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";

function GoLiveLanding() {
  const [accessKey, setAccessKey] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralLinkRef = useRef(null);
  const [referralCode, setReferralCode] = useState('');


  const handleAccessKeyChange = (e) => setAccessKey(e.target.value);
  const handleEmail = (e) => setEmail(e.target.value);
  const handleFullName = (e) => setFullName(e.target.value);

  const copyReferralLink = () => {
    referralLinkRef.current.select();
    document.execCommand('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const generateReferralCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };
    setReferralCode(generateReferralCode());
  }, []);

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
      <div className={styles.bigContainer}>
      <div className={styles.container}>
          <h1 className={styles.title}>Join The Top Engineering Talent Pool</h1>
          <h2 className={styles.subtitle}>Get Notified to Secure Your Spot in our Fall '24 Cohort!</h2>
          <form onSubmit={handleWaitlistSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input 
                type="text" 
                value={email} 
                onChange={handleEmail} 
                placeholder=".edu Email"
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
            <button type="submit" className={styles.submitButton}> <IoEnter /> Submit</button>
          </form>
          {success && <p className={styles.successText}>{success}</p>}
          <div className={styles.referralSection}>
            <h3 className={styles.referralTitle}>Refer Talent</h3>
            <p className={styles.referralExplainer}>Share this link to record your referrals. Each applicant who joins will earn you points:</p>
            <div className={styles.referralLinkContainer}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/launch?ref=${referralCode}`}
                  ref={referralLinkRef}
                  className={styles.referralLink}
                />
              <button onClick={copyReferralLink} className={styles.copyButton}>
                <FaCopy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        {/*
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
        */}
        <button onClick={() => navigate('/')} className={styles.backButton}>What is Silo?</button>
      </div>
    </div>
    
  );
}

export default GoLiveLanding;



