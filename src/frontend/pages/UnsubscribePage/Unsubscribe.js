
import React, { useState } from 'react';
import styles from './Unsubscribe.module.css';

const UnsubscribeForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement unsubscribe logic here
    console.log('Unsubscribe email:', email);
    // Reset the form
    setEmail('');
  };

  return (
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
  );
};

export default UnsubscribeForm;
