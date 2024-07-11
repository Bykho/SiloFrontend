import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import Tagged from '../../components/TagsFeed';
import FeedSidebar from '../../components/FeedSidebar';
import styles from './feed.module.css';
import GameOfLife from '../SiloDescriptionPage/GameOfLife';
import config from '../../config';
import {FaSearch} from 'react-icons/fa';


const Feed = () => {
  const [FeedStyle, setFeedStyle] = useState('showTagged');
  const { isAuthenticated } = useUser();
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
  
  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.testTitle}>
        <h1 className={styles.aboutHeader}>About Silo.</h1>
      </div>
      <div className={styles.description}>
        <p>
        Welcome to Silo, the first networking platform designed exclusively for the STEM community.
        Connect with students, professors, recruiters, and investors to showcase your projects, collaborate on research, and expand your professional network. 
        Whether you're looking to gain visibility for your work, find collaborators, or explore top talents, Silo offers a unique, exclusive environment that bridges academia and industry. Join now to innovate, learn, and grow together!
        </p>
      </div>
    </div>
    );
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.searchBar}>
        <div className={styles.searchWords}>
          <p style={{ textAlign: 'left' }}><FaSearch /></p>
        </div>
        <div className={styles.buttonContainer}>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Machine Learning"
            className={styles.searchInput}
          />
          <button className={styles.navButton} onClick={() => setTag(searchText)}>Search</button>
        </div>
        <div className={styles.sortDropdown}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="top">Top</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <div className={styles.resultsCount}>
          Results: {filteredProjects.length}
        </div>
      </div>

      <div className={styles.feedBottomContainer}>
        <div className={styles.feedSidebar}>
          <FeedSidebar />
        </div>
        <div className={styles.feedContent}>
          <Tagged />
        </div>
      </div>
    </div>
  );
};

export default Feed;
