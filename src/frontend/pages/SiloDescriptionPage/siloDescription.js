

import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './siloDescription.module.css';
import GameOfLife from './GameOfLife';
import UserSpiderPlot from '../../components/UserSpiderPlot';
import config from '../../config';
import { FaWindowClose } from 'react-icons/fa';

function SiloDescription() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    setIsLoaded(true);

    // Fetch the user data when the component mounts
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);  // Set the fetched user data to state
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data');
      }
    };

    fetchUserData();
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const goToStudentProfile = () => {
    navigate('/studentProfile');
  };

  const handleCreateProjectClick = () => {
    toggleModal(); // Open the modal instead of navigating
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundAnimation}>
       <spline-viewer url="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode" background="rgba(0,0,0,0.3)"></spline-viewer>      </div>
            {/*
            <div className={styles.leftContent}>  
            <div className={styles.testTitle}>
              <h1 className={`${styles.aboutHeader} ${isLoaded ? styles.headerLoaded : ''}`}>
                <div className={styles.helloLine}>
                  <span className={styles.letters}>H</span><span className={styles.letters}>e</span><span className={styles.letters}>l</span><span className={styles.letters}>l</span><span className={styles.letters}>o</span>
                </div>
                <div className={styles.worldLine}>
                  <span className={styles.letters}>W</span><span className={styles.letters}>o</span><span className={styles.letters}>r</span><span className={styles.letters}>l</span><span className={styles.letters}>d</span>
                </div>
              </h1>
            </div>
          </div>
          */}
          <div className={styles.rightContent}>
            <div className={`${styles.ctaContainer} ${isLoaded ? styles.ctaLoaded : ''}`}>
              <p className={styles.cta}>LinkedIn wasn't built for engineers.</p>
              <p className={styles.cta}>Silo was.</p>
            </div>
            <button 
              onClick={goToStudentProfile}
              className={`${styles.createButton} ${isLoaded ? styles.buttonLoaded : ''}`}     
            >
              Build My Portfolio
            </button>
          </div>
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={toggleModal}><FaWindowClose /></button>
            {/* 
            {userData ? (
              <UserSpiderPlot playerData={userData.scores[userData.scores.length - 1]} userData={{}} />
            ) : (
              <p>Loading...</p>
            )}
            */}
          </div>
        </div>
      )}
    </div>
  );
}

export default SiloDescription;


