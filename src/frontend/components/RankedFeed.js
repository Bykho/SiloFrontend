



import React, { useState, useEffect } from 'react';
import styles from './rankedFeed.module.css'; // Import the CSS module
import ProjectEntry from './ProjectEntry';
import { useUser } from '../contexts/UserContext';

import config from '../config';


const Feed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('impactful');
  const { user } = useUser();

  useEffect(() => {
    const fetchProjects = async (feedType) => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnFeed/${feedType}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        setProjects(projects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };
    fetchProjects(filter);
  }, [filter]);

  return (
    <div className={styles.feedContainer}>
      <div className={styles.navBar}>
        <div className={styles.navWords}>
          <p style={{ textAlign: 'left' }}>Top projects listed by most...</p>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.navButton} onClick={() => setFilter('impactful')}>Impactful</button>
          <button className={styles.navButton} onClick={() => setFilter('innovative')}>Innovative</button>
          <button className={styles.navButton} onClick={() => setFilter('interesting')}>Interesting</button>
        </div>
      </div>
      <div className={styles.projectList}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          projects.map((project, index) => (
            <div key={index} className={styles.projectItem}>
              <ProjectEntry project={project} passedUser={user} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;









