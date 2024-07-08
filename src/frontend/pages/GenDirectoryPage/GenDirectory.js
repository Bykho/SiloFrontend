import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './genDirectory.module.css';
import { useUser } from '../../contexts/UserContext';
import UserSearch from '../../components/UserSearch';
import ProjectSearch from '../../components/ProjectSearch'
import config from '../../config';

function Directory() {
  const navigate = useNavigate();
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedStyle, setFeedStyle] = useState('showUserSearch');
  const { user } = useUser();

  return (
    <div className={styles.container}>
      <div className={styles.navBar}>
        <p>Filter by: </p>
        <p
          className={`${styles.navLink} ${feedStyle === 'showUserSearch' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showUserSearch')}
        >
          Profiles
        </p>
        <p
          className={`${styles.navLink} ${feedStyle === 'showProjectSearch' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showProjectSearch')}
        >
          Projects
        </p>
      </div>
      <div className={styles.feedContainer}>
        {feedStyle === 'showUserSearch' && <UserSearch />}
        {feedStyle === 'showProjectSearch' && <ProjectSearch />}
      </div>
    </div>
  );  
}

export default Directory;