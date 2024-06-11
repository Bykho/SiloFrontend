



import React from 'react';
import { useUser } from '../contexts/UserContext';
import ProjectEntry from './ProjectEntry';
import styles from './portfolioDisplay.module.css';

const PortfolioDisplay = ({ user: passedUser }) => {
  const { user, updateUser } = useUser();

  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        <h3 className={styles.projectsTitle}>Projects</h3>
        <ul>
          {passedUser.portfolio.map((project, index) => (
            <ProjectEntry
              key={index}
              project={project}
              passedUser={passedUser}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PortfolioDisplay;





