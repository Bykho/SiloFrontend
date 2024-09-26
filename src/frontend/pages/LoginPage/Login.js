


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './login.module.css';
import GameOfLife from './GameOfLife';
import { Mail, Lock, User } from 'lucide-react';
import config from '../../config';
import PasswordReset from './PasswordReset'; // Import the PasswordReset component


const MobileMessage = ({ message }) => (
  <div className="mobile-message">
    <div className="mobile-message-content">
      <h2>Mobile Device Detected</h2>
      <p>{message}</p>
    </div>
  </div>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this breakpoint as needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/siloDescription');
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  const toggleLoginForm = () => setShowLoginForm(!showLoginForm);
  const togglePasswordReset = () => setShowPasswordReset(!showPasswordReset); // Function to toggle the password reset modal

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.background}>
      <div className={styles.container}>
      <img src="/silo_logo.png" alt="Silo Logo" className={styles.logo} />
      <div className={styles.siloStyle}>S    i   l   o</div>
        {isMobile ? (
          <MobileMessage message="While we're in beta, please use a laptop or desktop computer for the best experience."/>
        ) : (
          <>
            {!showLoginForm ? (
              <div className={styles.buttonContainer}>
                <button className={`${styles.button} ${styles.loginButton}`} onClick={toggleLoginForm}>Login</button>
                <a className={`${styles.button} ${styles.createButton}`} href="/SignUp">Create Account</a>
              </div>
            ) : (
              <>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.formInfoContainer}>
                  <div className={styles.inputContainer}>
                    <Mail className={styles.inputIcon} size={20} />
                    <input 
                      type="email" 
                      className={styles.emailInput}
                      value={email} 
                      onChange={handleEmailChange} 
                      placeholder="Enter your email" 
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input 
                      type="password" 
                      className={styles.passwordInput}
                      value={password} 
                      onChange={handlePasswordChange} 
                      placeholder="Enter your password" 
                    />
                  </div>
                  <button type="submit" className={`${styles.button} ${styles.submitButton}`}>Sign In</button>
                  <button type="button" className={styles.forgotPasswordButton} onClick={togglePasswordReset}>Forgot Password?</button>
                </form>
              </>
            )}
          </>
        )}
      </div>
      {showPasswordReset && <PasswordReset onClose={togglePasswordReset} />} {/* Render the PasswordReset component */}
    </div>
    </div>
  );
}

export default Login;




