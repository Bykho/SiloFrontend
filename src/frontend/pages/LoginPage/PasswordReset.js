

import React, { useState } from 'react';
import styles from './passwordReset.module.css';
import config from '../../config';

function PasswordReset({ onClose }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code, 3: enter new password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/send-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${config.apiBaseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password successfully reset');
        setTimeout(() => onClose(), 2000); // Close the modal after 2 seconds
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <h2>Reset Password</h2>
            <input 
              type="email" 
              placeholder="Input email associated with account" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit}>
            <h2>Enter Verification Code</h2>
            <input 
              type="text" 
              placeholder="Enter the code sent to your email" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handlePasswordReset}>
            <h2>Reset Password</h2>
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Confirm new password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

export default PasswordReset;


