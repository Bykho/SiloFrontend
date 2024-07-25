import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { IoHomeOutline, IoPersonOutline, IoChatboxEllipsesOutline, IoLogOutOutline, IoLogInOutline, IoNewspaperOutline } from 'react-icons/io5'; // Import new icons
import {PiAddressBookLight, PiAddressBook} from 'react-icons/pi'; // Import new icons
import { LuUserSquare2 } from 'react-icons/lu';
import { FaUserGroup } from 'react-icons/fa6';
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
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>SILO_Beta</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              <IoNewspaperOutline className={styles.icon} /> feed
            </a>
            <a
              href="/groups"
              className={`${styles.button} ${activeLink === 'groups' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('groups')}
            >
              <FaUserGroup className={styles.icon} /> Groups
            </a>
            <a
              href="/studentProfile"
              className={`${styles.button} ${(activeLink === 'folio' && currentPath !== '/siloDescription') ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('folio')}
            >
              <LuUserSquare2 className={styles.icon} /> profile
            </a>
            <a
              href="/GenDirectory"
              className={`${styles.button} ${activeLink === 'find' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('find')}
            >
              <PiAddressBook className={styles.icon} /> network
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
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>S i l o</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              <IoHomeOutline className={styles.icon} /> feed
            </a>
            <a
              href="/login"
              className={`${styles.button} ${activeLink === 'login' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('login')}
            >
              <IoLogInOutline className={styles.icon} /> login
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default NavigationBar;
