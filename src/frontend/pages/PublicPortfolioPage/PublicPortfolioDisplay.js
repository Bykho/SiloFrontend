

import React from 'react';
import styles from './publicPortfolioDisplay.module.css';
import PublicSmallProjectEntry from './PublicSmallProjectEntry';

const PublicPortfolioDisplay = ({ user }) => {
  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        {user.portfolio.map((project, index) => {
          if (project.visibility !== undefined && project.visibility === false) {
            return null;
          }
          return (
            <PublicSmallProjectEntry
              key={index}
              project={project}
              user={user}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PublicPortfolioDisplay;


