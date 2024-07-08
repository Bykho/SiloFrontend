



import React, { useState, useEffect } from 'react';
import styles from './userSearch.module.css';
import { useUser } from '../contexts/UserContext';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { Search, User, Briefcase, Mail, Tag } from 'lucide-react';

const ProjectFeed = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [value, setValue] = useState('AI Society');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/projectFilteredSearch/${value}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        console.log('project directory: ', response);
        const projectData = await response.json();
        setProjects(projectData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };
    fetchProjects();
  }, [value]);

  const handleSearch = (e) => {
    e.preventDefault();
    setValue(searchText);
  };

  return (
    <div className={styles.feedContainer}>
      <h1 className={styles.title}>Project Directory</h1>
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search projects"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>
        <div className={styles.resultsCount}>
          Results: {projects.length}
        </div>
      </div>
      <div className={styles.userList}>
        {loading ? (
          <div className={styles.loadingSpinner}></div>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : (
          projects.map((specificProject, index) => (
            <div key={index} className={styles.userCard}>
              <div className={styles.userHeader}>
                <ProfileImage username={specificProject.createdBy} size='large' />
                <div className={styles.userMainInfo}>
                  <h3 className={styles.username}>{specificProject.projectName}</h3>
                  <p className={styles.userType}>
                    <User size={16} />
                    Created by: {specificProject.createdBy}
                  </p>
                </div>
              </div>
              <div className={styles.userDetails}>
                <p>
                  <Briefcase size={16} />
                  Description: {specificProject.projectDescription}
                </p>
                <p>
                  <Tag size={16} />
                  Tags: {specificProject.tags ? specificProject.tags.join(', ') : 'No tags listed'}
                </p>
                {specificProject.github_link && (
                  <p>
                    <a href={specificProject.github_link} target="_blank" rel="noopener noreferrer">
                      <Briefcase size={16} />
                      GitHub Link
                    </a>
                  </p>
                )}
              </div>
              <button className={styles.viewProfileButton} onClick={() => navigate(`/project/${specificProject.createdBy}`)}>
                View Project
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectFeed;





