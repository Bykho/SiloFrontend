


import React from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './portfolioDisplay.module.css';
import ProjectEntry from './ProjectEntryPage/ProjectEntry';
import SmallProjectEntry from './ProjectEntryPage/SmallProjectEntry';


const PortfolioDisplay = ({ user: passedUser}) => {
  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        <h3 className={styles.projectsTitle}>Projects</h3>
        {passedUser.portfolio.map((project, index) => (
          <SmallProjectEntry
            key={index}
            project={project}
            passedUser={passedUser}
          />
        ))}
      </div>
    </div>
  );
};

export default PortfolioDisplay;






