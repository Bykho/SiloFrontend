// src/frontend/pages/SignUpPage/LinkedInAuthButton.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import styles from './linkedInAuth.module.css';
import { useUser } from '../../contexts/UserContext'; // Import useUser from UserContext

const LinkedInAuthButton = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const LINKEDIN_CLIENT_ID = '78etgv4pahvfr5';
  const REDIRECT_URI = window.location.origin + '/linkedin-callback';

  const generateState = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('linkedInState', state);
    return state;
  };

  const handleLinkedInLogin = () => {
    setIsAuthenticating(true);
    setError('');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const state = generateState();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: state,
      scope: 'openid profile'
    }).toString();

    console.log('LinkedIn auth params:', params);

    // LinkedIn URLs
    const webUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    const linkedInAppUrl = `linkedin://oauth?${params}`;

    try {
      if (isMobile) {
        console.log('Attempting to open LinkedIn mobile app');
        window.location.replace(linkedInAppUrl);

        setTimeout(() => {
          if (document.hasFocus()) {
            console.log('Fallback to web OAuth');
            window.location.replace(webUrl);
          }
        }, 2000);
      } else {
        console.log('Redirecting to LinkedIn web OAuth');
        window.location.replace(webUrl);
      }
    } catch (err) {
      console.error('Failed to open LinkedIn authentication:', err);
      setError('Failed to open LinkedIn authentication');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {error && (
        <div className={styles.alert}>
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleLinkedInLogin}
        disabled={isAuthenticating}
        className="w-full flex items-center justify-center gap-2 bg-[#0077B5] text-white px-4 py-2 rounded-lg hover:bg-[#006497] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
        {isAuthenticating ? 'Connecting to LinkedIn...' : 'Sign in with LinkedIn'}
      </button>
    </div>
  );
};

export default LinkedInAuthButton;
