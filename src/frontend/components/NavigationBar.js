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
import { SiArxiv } from "react-icons/si";
import { FaCircleNodes } from "react-icons/fa6";
import { MdScience } from "react-icons/md";



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
              <IoNewspaperOutline className={styles.icon} /> Community
            </a>

            <a
              href="/research"
              className={`${styles.button} ${activeLink === 'research' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('research')}
            >
              <MdScience className={styles.icon} /> Research
            </a>
            {/*
            <a
              href="/jobs"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('jobs')}
            >
              <FaBriefcase className={styles.icon} /> Jobs
            </a>
            */}
            <a
              href="/graph"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
              onClick={() => handleLinkClick('jobs')}
            >
              < FaCircleNodes className={styles.icon} /> Knowledge
              
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
          <div className={styles.logoContainer}>
            <img src="/silo_logo.png" alt="Silo Logo" className={styles.logoIcon} />
            <div className={styles.logoButton}>Silo</div>
          </div>
          <div>
            <a
              href="/feed"
              className={`${styles.button} ${activeLink === 'feed' ? styles.clickedButton : ''}`}
            >
              <IoNewspaperOutline className={styles.icon} /> Community
            </a>

            <a
              href="/research"
              className={`${styles.button} ${activeLink === 'research' ? styles.clickedButton : ''}`}
            >
              <MdScience className={styles.icon} /> Research
            </a>

            {/*
            <a
              href="/jobs"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
            >
              <FaBriefcase className={styles.icon} /> Jobs
            </a>
            */}

            <a
              href="/graph"
              className={`${styles.button} ${activeLink === 'jobs' ? styles.clickedButton : ''}`}
            >
              < FaCircleNodes className={styles.icon} /> Knowledge
              
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
