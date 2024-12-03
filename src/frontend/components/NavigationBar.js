import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { IoLogOutOutline } from 'react-icons/io5';
import { LuUserSquare2 } from 'react-icons/lu';
import { MdOutlineLeaderboard } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
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
          <div className={styles.logoContainer}>
            <img src="/silo_logo.png" alt="Silo Logo" className={styles.logoIcon} />
            <div className={styles.logoButton}>Silo</div>
          </div>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              <FaSearch className={styles.icon} /> Explore
            </a>

            <a
              href="/GenDirectory"
              className={`${styles.button} ${activeLink === 'find' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('find')}
            >
              <MdOutlineLeaderboard className={styles.icon} /> Members
            </a>

            <a
              href="/studentProfile"
              className={`${styles.button} ${(activeLink === 'folio' && currentPath !== '/siloDescription') ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('folio')}
            >
              <LuUserSquare2 className={styles.icon} /> Profile
            </a>

            <button
              onClick={handleLogout}
              className={`${styles.logoutButton} ${activeLink === 'logout' ? styles.clickedButton : ''}`}
            >
              <IoLogOutOutline className={styles.logoutIcon} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.logoContainer}>
            <img src="/silo_logo.png" alt="Silo Logo" className={styles.logoIcon} />
            <div className={styles.logoButton}>Silo</div>
          </div>
          <div>

            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              <FaSearch className={styles.icon} /> Explore
            </a>

            <a
              href="/GenDirectory"
              className={`${styles.button} ${activeLink === 'find' ? styles.clickedButton : ''}`}
            >
              <MdOutlineLeaderboard className={styles.icon} /> Members
            </a>

            <a
              href="/studentProfile"
              className={`${styles.button} ${(activeLink === 'folio' && currentPath !== '/siloDescription') ? styles.clickedButton : ''}`}
            >
              <LuUserSquare2 className={styles.icon} /> Profile
            </a>

            <button
              className={`${styles.logoutButton} ${activeLink === 'logout' ? styles.clickedButton : ''}`}
            >
              <IoLogOutOutline className={styles.logoutIcon} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NavigationBar;