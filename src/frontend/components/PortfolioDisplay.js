


import React from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './portfolioDisplay.module.css';
import ProjectEntry from './ProjectEntryPage/ProjectEntry';

const PortfolioDisplay = ({ user: passedUser}) => {

  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        <h3 className={styles.projectsTitle}>Projects</h3>
          {passedUser.portfolio.map((project, index) => {
            return (
              <ProjectEntry
                project={project}
                passedUser={passedUser}
              />
            );
          })}
      </div>
    </div>
  );
};

export default PortfolioDisplay;





