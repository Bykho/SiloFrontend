import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PointsPage.module.css';
import config from '../../config';
import GameOfLife from '../LoginPage/GameOfLife';
import { IoEnter } from "react-icons/io5";
import { FaBackward, FaCopy } from 'react-icons/fa';
import ReferralProgressBar from './ReferralProgressBar';

function PointsPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [referralCount, setReferralCount] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleEmail = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReferralCount(null);
    setReferralCode('');

    try {
      const response = await fetch(`${config.apiBaseUrl}/getReferralCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setReferralCount(data.referral_count);
        setReferralCode(data.referral_code);
      } else {
        setError(data.error || 'Failed to retrieve referral information');
      }
    } catch (error) {
      setError(error.message || 'Failed to retrieve referral information');
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/launch?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.bigContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>Check Your Referral Points</h1>
          {referralCount !== null && (
            <div className={styles.resultContainer}>
              <p className={styles.resultText}>You have made <span className={styles.pointsHighlight}>{referralCount}</span> referrals!</p>
              <p className={styles.resultText2}>When your referrees are admitted, you will earn the following rewards:</p>
              <ReferralProgressBar referrals={referralCount} />
              <div className={styles.divider}></div>
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input 
                type="email" 
                value={email} 
                onChange={handleEmail} 
                placeholder="Enter your email"
                className={styles.inputText}
              />
            </div>
            <button type="submit" className={styles.submitButton}><IoEnter /> Check Points</button>
          </form>
          {referralCode && (
            <div className={styles.referralLinkContainer}>
              <p className={styles.referralLinkText}>Your unique referral link:</p>
              <div className={styles.referralLinkWrapper}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/launch?ref=${referralCode}`}
                  className={styles.referralLink}
                />
                <button onClick={copyReferralLink} className={styles.copyButton}>
                  <FaCopy /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={() => navigate('/')} className={styles.backButton}>What is Silo?</button>
          <button onClick={() => navigate('/launch')} className={styles.backButton}> <FaBackward /> Back</button>
        </div>
      </div>
    </div>
  );
}

export default PointsPage;