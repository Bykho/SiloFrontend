



import React, { useState, useEffect } from 'react';
import styles from './interestFeed.module.css'; // Import the CSS module
import { useUser } from '../contexts/UserContext';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';

import config from '../config';



const Feed = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interests, setInterests] = useState('NLP');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        //We can just use the route from genDirectory.
        const response = await fetch(`${config.apiBaseUrl}/genDirectory`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const userData = await response.json();
        setUsers(userData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((specificUser) =>
    specificUser.interests && specificUser.interests.includes(interests)
  );

  return (
    <div className={styles.feedContainer}>
      <div className={styles.searchBar}>
        <div className={styles.searchWords}>
          <p style={{ textAlign: 'left' }}>Search Users by interest:</p>
        </div>
        <div className={styles.buttonContainer}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="NLP"
            className={styles.searchInput}
          />
          <button className={styles.navButton} onClick={() => setInterests(searchText)}>Search</button>
        </div>
      </div>
      <div className={styles.resultsCount}>
        Results: {filteredUsers.length}
      </div>
      <div className={styles.userList}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredUsers.map((specificUser, index) => (
            <div key={index} className={styles.userItem}>

              <div className={styles.infoHolder}>
                <div className={styles.userInfo}>
                    <ProfileImage username={specificUser.username} size='large' />
                    <h3 className={styles.username}>{specificUser.username}</h3>
                  <div className={styles.typeEmailContainer}>
                      <p className={styles.type}>{specificUser.user_type}</p>
                      <p className={styles.email}>{specificUser.email}</p>
                  </div>
                  <div className={styles.interestsContainer}>
                      <h2>Interests: {specificUser.interests ? specificUser.interests.join(', ') : 'No interests listed'}</h2>
                      <h2>Organizations: {specificUser.orgs ? specificUser.orgs.join(', ') : 'No orgs listed'}</h2>
                  </div>
                    <button className={styles.button} onClick={() => navigate(`/profile/${specificUser.username}`)}> view profile </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;





