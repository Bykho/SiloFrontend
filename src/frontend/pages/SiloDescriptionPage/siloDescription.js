import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import styles from './siloDescription.module.css';
import GameOfLife from './GameOfLife';


function SiloDescription() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleCreateProjectClick = () => {
    navigate('/studentProfile', { state: { buildPortfolio: true } }); // Navigate to /studentProfile
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundAnimation}>
        <GameOfLife />
      </div>
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
      <div className={styles.rightContent}>
        <div className={`${styles.ctaContainer} ${isLoaded ? styles.ctaLoaded : ''}`}>
          <p className={styles.cta}>LinkedIn wasn't built for engineers.</p>
          <p className={styles.cta}>Silo is.</p>
        </div>
        <button 
          className={`${styles.createButton} ${isLoaded ? styles.buttonLoaded : ''}`}
          onClick={handleCreateProjectClick} // Add onClick handler
        >
          Build Your Portfolio
        </button>
      </div>
    </div>
  );
}

export default SiloDescription;


