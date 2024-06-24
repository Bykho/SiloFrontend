import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import styles from './NavigationBar.module.css';

const NavigationBar = () => {
  const { user, logout, activeLink, setActiveLink } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    console.log('activeLink, ', activeLink);
  }, [activeLink]);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleLogout = () => {
    logout();
    handleLinkClick('login');
    navigate('/login');
  };

  return (
    <div className={styles.nav}>
      {user ? (
        <>
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>S i l o _ Beta</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              feed
            </a>
            <a
              href="/studentProfile"
              className={`${styles.button} ${(activeLink === 'folio' && currentPath !== '/siloDescription') ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('folio')}
            >
              folio
            </a>
            <a
              href="/GenDirectory"
              className={`${styles.button} ${activeLink === 'find' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('find')}
            >
              forum
            </a>
            <button
              onClick={handleLogout}
              className={`${styles.button} ${activeLink === 'logout' ? styles.clickedButton : ''}`}
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
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              feed
            </a>
            <a
              href="/login"
              className={`${styles.button} ${activeLink === 'login' ? styles.clickedButton : ''}`}
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
