import React, { useState } from 'react';
import styles from './Unsubscribe.module.css';
import config from '../../config';


const UnsubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${config.apiBaseUrl}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatusMessage('Successfully unsubscribed.');
      } else {
        setStatusMessage('Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatusMessage('An error occurred. Please try again later.');
    }

    setEmail('');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Unsubscribe
        </button>
      </form>
      {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
    </div>
  );
};

export default UnsubscribeForm;


