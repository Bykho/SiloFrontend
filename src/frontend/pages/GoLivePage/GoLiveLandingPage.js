import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './GoLiveLandingPage.module.css';
import config from '../../config';
import GameOfLife from '../LoginPage/GameOfLife';
import { IoEnter } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ReferralProgressBar from './ReferralProgressBar';

function GoLiveLanding() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralLinkRef = useRef(null);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const location = useLocation();
  const [referralCount, setReferralCount] = useState(0);

  const handleEmail = (e) => setEmail(e.target.value);
  const handleFullName = (e) => setFullName(e.target.value);

  const copyReferralLink = () => {
    referralLinkRef.current.select();
    document.execCommand('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeReferral = () => {
    setShowReferral(false);
  };

  const handleRefClick = () => {
    setShowReferral(false);
    navigate("/points")  // Close the modal first
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      console.log("Referred by:", refCode);
    }
  }, [location]);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const params = new URLSearchParams(location.search);
    const referredBy = params.get('ref');

    try {
      const response = await fetch(`${config.apiBaseUrl}/joinWaitingList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          full_name: fullName,
          referred_by: referredBy
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Successfully Added to Waitlist!');
        setReferralCode(data.referral_code);
        setReferralCount(data.referral_count || 0);
        setShowReferral(true);
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
                placeholder="Personal Email"
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
            <button type="submit" className={styles.submitButton}><IoEnter /> Submit</button>
          </form>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
        <div className={`${styles.overlay} ${showReferral ? styles.show : ''}`} onClick={closeReferral}></div>
        <div className={`${styles.referralSection} ${showReferral ? styles.show : ''}`}>
          <button onClick={closeReferral} className={styles.closeButton}><IoClose /></button>
          <p className={styles.successText}>{success}</p>
          <h3 className={styles.referralTitle}>Refer Talent</h3>
          <p className={styles.referralExplainer}>Share this link! Each applicant who joins will earn you points:</p>
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
          <button className={styles.refButton} onClick={handleRefClick}> View Referral Rewards </button>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={() => navigate('/')} className={styles.backButton}>What is Silo?</button>
          <button onClick={() => navigate('/points')} className={styles.backButton}> View Referral Rewards </button>
        </div>
      </div>
    </div>
  );
}

export default GoLiveLanding;