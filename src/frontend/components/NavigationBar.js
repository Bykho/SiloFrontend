import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { IoHomeOutline, IoPersonOutline, IoChatboxEllipsesOutline, IoLogOutOutline, IoLogInOutline, IoNewspaperOutline } from 'react-icons/io5'; // Import new icons
import {PiAddressBookLight, PiAddressBook} from 'react-icons/pi'; // Import new icons
import { LuUserSquare2 } from 'react-icons/lu';
import { FaUserGroup } from 'react-icons/fa6';
import styles from './NavigationBar.module.css';
import SiloBetaButton from './AnimatedSiloButton';
import NotificationsComponent from './Notifications';
import { Bell } from 'lucide-react';
import { MdOutlineLeaderboard } from "react-icons/md";
import {FaBriefcase} from "react-icons/fa6";


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
          <SiloBetaButton onClick={() => handleLinkClick('other')} />
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('feed')}
            >
              <IoNewspaperOutline className={styles.icon} /> Community
            </a>

            <a
              href="/jobs"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('jobs')}
            >
              <FaBriefcase className={styles.icon} /> Jobs
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
            <NotificationsComponent />
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
          <a href="/siloDescription" className={styles.siloButton} onClick={() => handleLinkClick('other')}>Silo_Beta</a>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
            >
              <IoNewspaperOutline className={styles.icon} /> Community
            </a>

            <a
              href="/jobs"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
            >
              <FaBriefcase className={styles.icon} /> Jobs
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
            <Bell size={24} color="#ffffff" className={styles.notificationButton}/>
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
