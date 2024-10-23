// MobileSignUp.js
import React, { useState, useEffect } from 'react';
import styles from './mobileSignUp.module.css';
import LinkedInCallback from '../SignUpPage/LinkedInCallback';
import config from '../../config';

const MobileSignUp = () => {
  const [userName, setUserName] = useState('');
  const [showCallback, setShowCallback] = useState(false);

  const handleLinkedInSignUp = () => {
    const LINKEDIN_CLIENT_ID = '78etgv4pahvfr5';
    const REDIRECT_URI = 'http://localhost:3000/linkedin-callback';
    const state = crypto.randomUUID();
    sessionStorage.setItem('linkedInState', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: 'openid profile email'
    }).toString();
    
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    window.location.replace(linkedInAuthUrl);
};

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) {
      setShowCallback(true);
    }
  }, []);

  const handleCallbackComplete = (user) => {
    if (user && user.name) {
      setUserName(user.name);
      setShowCallback(false);
    }
  };

  if (showCallback) {
    return <LinkedInCallback onComplete={handleCallbackComplete} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up with LinkedIn</h1>
      {userName ? (
        <p>Welcome, {userName}!</p>
      ) : (
        <button onClick={handleLinkedInSignUp} className={styles.linkedInButton}>
          Sign up with LinkedIn
        </button>
      )}
    </div>
  );
};

export default MobileSignUp;
