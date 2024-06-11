


import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import styles from './NavigationBar.module.css';

const NavigationBar = () => {
  const { user, logout, activeLink, setActiveLink } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('This message runs when the Navigation Bar component mounts')
  }, [activeLink]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleLogout = () => {
    logout();
    handleLinkClick('login');
    navigate('/login');
  }

  return (
    <div className={styles.nav}>
      {user ? (
        <>
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>S i l o @ Columbia</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.active : styles.inactive}`}
              onClick={() => handleLinkClick('feed')}
            >
              feed
            </a>
            <a
              href="/studentProfile"
              className={`${styles.button} ${activeLink === 'profile' ? styles.active : styles.inactive}`}
              onClick={() => handleLinkClick('profile')}
            >
              folio
            </a>
            <a
              href="/GenDirectory"
              className={`${styles.button} ${activeLink === 'directory' ? styles.active : styles.inactive}`}
              onClick={() => handleLinkClick('directory')}
            >
              find
            </a>
            <button
              onClick={handleLogout}
              className={`${styles.button} ${activeLink === 'logout' ? styles.active : styles.inactive}`}
            >
              logout
            </button>
          </div>
        </>
      ) : (
        <>
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>S i l o</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.active : styles.inactive}`}
              onClick={() => handleLinkClick('feed')}
            >
              feed
            </a>
            <a
              href="/login"
              className={`${styles.button} ${activeLink === 'login' ? styles.active : styles.inactive}`}
              onClick={() => handleLinkClick('login')}
            >
              login
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default NavigationBar;

