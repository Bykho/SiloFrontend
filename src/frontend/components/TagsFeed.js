



import React, { useState, useEffect } from 'react';
import styles from './tagsFeed.module.css'; // Import the CSS module
import ProjectEntry from './ProjectEntryPage/ProjectEntry';
import { useUser } from '../contexts/UserContext';
import SmallProjectEntry from './ProjectEntryPage/SmallProjectEntry';
import config from '../config';
import LoadingIndicator from './LoadingIndicator';


const Feed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('impactful');
  const [tag, setTag] = useState('machine learning');
  const [searchText, setSearchText] = useState('');
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

  const filteredProjects = projects.filter((project) =>
    project.tags && project.tags.some((projectTag) => projectTag.toLowerCase().includes(tag.toLowerCase()))
  );

  
  return (
    <div className={styles.feedContainer}>
      <div className={styles.projectList}>
        {loading ? (
          <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingIndicator />
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredProjects.map((project, index) => (
            <div key={index} className={styles.projectItem}>
              <SmallProjectEntry project={project}/>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;






