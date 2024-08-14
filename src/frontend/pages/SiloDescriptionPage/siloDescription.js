import React, { useEffect, useState } from 'react';
import styles from './siloDescription.module.css';
import GameOfLife from './GameOfLife';
import UserSpiderPlot from '../../components/UserSpiderPlot'; // Import the UserSpiderPlot component

function SiloDescription() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal visibility

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCreateProjectClick = () => {
    toggleModal(); // Open the modal instead of navigating
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
          onClick={handleCreateProjectClick}
        >
          Build Your Portfolio
        </button>
      </div>
      
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={toggleModal}>Close</button>
            <UserSpiderPlot playerData={{}} userData={{}} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SiloDescription;