


import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import Tagged from '../../components/TagsFeed';
import FeedSidebar from '../../components/FeedSidebar';
import styles from './feed.module.css';
import GameOfLife from '../SiloDescriptionPage/GameOfLife';
import config from '../../config';
import { FaSearch } from 'react-icons/fa';

const Feed = () => {
  const [feedStyle, setFeedStyle] = useState('explore');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnFeed`, {
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
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log('here is search text: ', searchText);
    let filtered = projects;
  
    if (feedStyle === 'explore') {
      filtered = projects.filter(project => {
        const searchTextLower = searchText.toLowerCase();
        if (project.projectDescription.toLowerCase().includes(searchTextLower)) {
          return true;
        }
        for (let layer of project.layers) {
          for (let cell of layer) {
            if (cell.type === 'text' && cell.value.toLowerCase().includes(searchTextLower)) {
              return true;
            }
          }
        }
        if (project.projectName.toLowerCase().includes(searchTextLower)) {
          return true;
        }
        return false;
      });
    } else if (feedStyle === 'trending') {
      const now = new Date();
      filtered = projects.map(project => {
        const createdAt = new Date(project.created_at);
        const hoursElapsed = (now - createdAt) / (1000 * 60 * 60); // Convert milliseconds to hours
        const score = (project.upvotes ? project.upvotes.length : 0) / hoursElapsed;
        return { ...project, score };
      }).sort((a, b) => b.score - a.score);
    } else if (feedStyle === 'most upvoted') {
      filtered = [...projects].sort((a, b) => (b.upvotes ? b.upvotes.length : 0) - (a.upvotes ? a.upvotes.length : 0));
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchText, feedStyle]);


  return (
    <div className={styles.feedContainer}>
      {feedStyle === 'explore' && (
        <div className={styles.searchBar}>
          <div className={styles.searchWords}>
            <p style={{ textAlign: 'left' }}><FaSearch /></p>
          </div>
          <div className={styles.buttonContainer}>
            <input
              type="search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Machine Learning"
              className={styles.searchInput}
            />
            <button className={styles.navButton} onClick={() => setSearchText(inputText)}>Search</button>
          </div>
          <div className={styles.sortDropdown}>
            <select className={styles.sortSelect}>
              <option value="top">Top</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className={styles.resultsCount}>
            Results: {filteredProjects.length}
          </div>
        </div>
      )}

      <div className={styles.feedBottomContainer}>
        <div className={styles.feedSidebar}>
          <FeedSidebar setFeedStyle={setFeedStyle} />
        </div>
        <div className={styles.feedContent}>
          <Tagged filteredProjects={filteredProjects} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default Feed;



