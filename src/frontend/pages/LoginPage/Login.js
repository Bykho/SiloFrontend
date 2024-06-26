import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './login.module.css';
import GameOfLife from './GameOfLife';
import { Mail, Lock, User } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/siloDescription');
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  const toggleLoginForm = () => setShowLoginForm(!showLoginForm);



  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.container}>
        <img src='https://dummyflaska-b17a47997732.herokuapp.com/static/images/silo_logo.png' alt="Logo" className={styles.logo} />
        <div className={styles.siloStyle}>S    i    l    o</div>
        {!showLoginForm ? (
          <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.loginButton}`} onClick={toggleLoginForm}>Login</button>
            <a className={`${styles.button} ${styles.createButton}`} href="/SignUp">
              Create1
            </a>
          </div>
        ) : (
          <>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.formInfoContainer}>
              <div className={styles.inputContainer}>
                <User className={styles.inputIcon} size={20} />
                <input 
                  type="text" 
                  className={styles.usernameInput}
                  value={username} 
                  onChange={handleUsernameChange} 
                  placeholder="Enter your username" 
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
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
