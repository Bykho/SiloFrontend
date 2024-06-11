import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './login.module.css'; // Import the CSS file
import GameOfLife from './GameOfLife'; // Import the GameOfLife component

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
      navigate('/studentProfile');
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  const toggleLoginForm = () => setShowLoginForm(!showLoginForm);

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.container}>
        <img src="/silo_logo.png" alt="Silo Logo" className={styles.logo} />
          <div className={styles.siloStyle}>S    i    l    o</div>
        {!showLoginForm ? (
          <div className={styles.buttonContainer}>
            <a className={`${styles.button} ${styles.loginButton}`} onClick={toggleLoginForm}>Login</a>
            <a className={`${styles.button} ${styles.createButton}`} href="/SignUp">
              <p className={styles.subText}>Create</p>
            </a>
          </div>
        ) : (
          <>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.formInfoContainer}>
              <div className={styles.inputContainer}>
                <label>Name:</label>
                <input type="text" value={username} onChange={handleUsernameChange} />
              </div>
              <div className={styles.inputContainer}>
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} />
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
