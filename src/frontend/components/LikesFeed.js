import React, { useState, useEffect } from 'react';
import styles from './likesFeed.module.css'; // Import the CSS module
import ProjectEntry from './ProjectEntryPage/ProjectEntry';
import { useUser } from '../contexts/UserContext';
import config from '../config';

const Feed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeType, setLikeType] = useState('innovative');
  const { user } = useUser();

  useEffect(() => {
    const fetchProjects = async (projectIds) => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnProjects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectIds),
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
    if (user && user[`${likeType}_upvote`]) {
        fetchProjects(user[`${likeType}_upvote`]);
    }
  }, [likeType, user]);

  return (
    <div className={styles.feedContainer}>
      <div style={{padding: '20px' }}>
        <div className={styles.buttonContainer}>
          <button className={styles.navButton} onClick={() => setLikeType('innovative')}>Innovative</button>
          <button className={styles.navButton} onClick={() => setLikeType('impactful')}>Impactful</button>
          <button className={styles.navButton} onClick={() => setLikeType('interesting')}>Interesting</button>
        </div>
        <div className={styles.projectList}>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : projects.length === 0 ? (
            <p>You have no likes of this type</p>
          ) : (
            projects.map((project, index) => (
              <div key={index} className={styles.projectItem}>
                <ProjectEntry project={project} passedUser={user} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
