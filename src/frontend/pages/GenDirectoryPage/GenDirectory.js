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
      <div className={styles.feedContainer}>
        <UserSearch />
=      </div>
    </div>
  );  
}

export default Directory;