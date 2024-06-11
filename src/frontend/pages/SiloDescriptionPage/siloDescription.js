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
          Silo is a platform that connects students to share and collaborate on real-world projects. 
          Students can learn from each other's successes, showcase their work, and expand their professional network. 
          Professionals can find talented students to collaborate with, share their projects, and provide mentorship and guidance. 
          Silo aims to bridge the gap between students, broader education and industry, providing valuable opportunities for students and professionals to connect, collaborate, and grow together.
        </p>
      </div>
    </div>
  );
}

export default SiloDescription;
