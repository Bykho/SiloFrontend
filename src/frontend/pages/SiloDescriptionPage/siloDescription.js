import React from 'react';
import styles from './siloDescription.module.css';
import GameOfLife from './GameOfLife';

function SiloDescription() {
  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.testTitle}>
        <h1 className={styles.aboutHeader}>About Silo.</h1>
      </div>
      <div className={styles.description}>
        <p>
        Welcome to Silo, the first networking platform designed exclusively for the STEM community.
        Connect with students, professors, recruiters, and investors to showcase your projects, collaborate on research, and expand your professional network. 
        Whether you're looking to gain visibility for your work, find collaborators, or explore top talents, Silo offers a unique, exclusive environment that bridges academia and industry. Join now to innovate, learn, and grow together!
        </p>
      </div>
    </div>
  );
}

export default SiloDescription;
