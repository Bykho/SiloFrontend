import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './genDirectory.module.css';
import { useUser } from '../../contexts/UserContext';
import Orged from '../../components/OrgFeed';
import Interesed from '../../components/InterestFeed'
import config from '../../config';

function Directory() {
  const navigate = useNavigate();
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedStyle, setFeedStyle] = useState('showOrged');
  const { user } = useUser();

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/genDirectory`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch directory data');
        }

        const data = await response.json();
        setDirectory(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching directory data:', error);
        setLoading(false);
      }
    };

    fetchDirectory();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.navBar}>
        <p>Filter by: </p>
        <p
          className={`${styles.navLink} ${feedStyle === 'showOrged' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showOrged')}
        >
          Organization
        </p>
        <p
          className={`${styles.navLink} ${feedStyle === 'showInterests' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showInterests')}
        >
          Interests
        </p>
      </div>
      <div className={styles.feedContainer}>
        {feedStyle === 'showOrged' && <Orged />}
        {feedStyle === 'showInterests' && <Interesed />}
      </div>
    </div>
  );  
}

export default Directory;