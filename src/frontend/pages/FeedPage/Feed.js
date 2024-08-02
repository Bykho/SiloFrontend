import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Tagged from '../../components/TagsFeed';
import CombinedFeedSidebar from './NewFeedSidebar';
import styles from './feed.module.css';
import config from '../../config';
import { FaSearch } from 'react-icons/fa';

const Feed = () => {
  const [feedStyle, setFeedStyle] = useState('home');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('');
  const [userUpvotes, setUserUpvotes] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const { user } = useUser();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

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
        const returnedProjects = await response.json();
        setProjects(returnedProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    const fetchUpvotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/getUserUpvotes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user._id })
        });
        const data = await response.json();
        if (response.ok) {
          setUserUpvotes(data.upvotes);
        } else {
          console.error('Failed to fetch upvotes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching upvotes:', error);
      }
    };

    fetchProjects();
    if (user) {
      fetchUpvotes();
    }
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.tag) {
      const tag = location.state.tag;
      setSearchText(tag);
      setInputText(tag);
      setFeedStyle('home');
      searchInputRef.current.focus();
      setTimeout(() => {
        handleSearch();
        navigate('/feed', { replace: true });
      }, 0);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let filtered = projects;

    if (feedStyle === 'home' || feedStyle === 'popular') {
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
        if (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTextLower))) {
          return true;
        }
        return false;
      });
    }

    if (feedStyle === 'popular') {
      const now = new Date();
      filtered = filtered.map(project => {
        const createdAt = new Date(project.created_at);
        const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
        const score = (project.upvotes ? project.upvotes.length : 0) / hoursElapsed;
        return { ...project, score };
      }).sort((a, b) => b.score - a.score);
    }

    if (activeGroup) {
      filtered = filtered.filter(project => project.groupId === activeGroup._id);
    }

    setFilteredProjects(filtered);
  }, [projects, searchText, feedStyle, activeGroup]);

  const handleSearch = () => {
    setSearchText(inputText);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setSearchText(e.target.value);
  };

  const getHeaderText = () => {
    if (activeGroup) return activeGroup.name;
    return feedStyle.charAt(0).toUpperCase() + feedStyle.slice(1);
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedSidebar}>
        <CombinedFeedSidebar
          feedStyle={feedStyle}
          setFeedStyle={setFeedStyle}
          activeGroup={activeGroup}
          setActiveGroup={setActiveGroup}
        />
      </div>
      <div className={styles.feedMainContent}>
        <div className={styles.headerBox}>
          <h2>{getHeaderText()}</h2>
        </div>
        <div className={styles.searchBar}>
          <div className={styles.searchWords}>
            <FaSearch />
          </div>
          <div className={styles.buttonContainer}>
            <input
              ref={searchInputRef}
              type="search"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search projects..."
              className={styles.searchInput}
            />
          </div>
          <div className={styles.resultsCount}>
            Results: {filteredProjects.length}
          </div>
        </div>
        <div className={styles.feedContent}>
          <Tagged
            filteredProjects={filteredProjects}
            loading={loading}
            error={error}
            userUpvotes={userUpvotes}
            setUserUpvotes={setUserUpvotes}
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;