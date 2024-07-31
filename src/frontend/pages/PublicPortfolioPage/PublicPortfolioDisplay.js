

import React from 'react';
import styles from './publicPortfolioDisplay.module.css';
import PublicSmallProjectEntry from './PublicSmallProjectEntry';

const PublicPortfolioDisplay = ({ user }) => {
  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        <h3 className={styles.projectsTitle}>Projects</h3>
        {user.portfolio.map((project, index) => (
          <PublicSmallProjectEntry
            key={index}
            project={project}
            user={user}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicPortfolioDisplay;


