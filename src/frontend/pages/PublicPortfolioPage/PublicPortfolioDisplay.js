

import React from 'react';
import styles from './publicPortfolioDisplay.module.css';
import PublicSmallProjectEntry from './PublicSmallProjectEntry';

const PublicPortfolioDisplay = ({ user: passedUser }) => {
  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        <h3 className={styles.projectsTitle}>Projects</h3>
        {passedUser.portfolio.map((project, index) => (
          <PublicSmallProjectEntry
            key={index}
            project={project}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicPortfolioDisplay;


