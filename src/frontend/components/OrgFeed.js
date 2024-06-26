import React, { useState, useEffect } from 'react';
import styles from './orgFeed.module.css';
import { useUser } from '../contexts/UserContext';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { Search, User, Briefcase, Mail, Tag } from 'lucide-react';

const Feed = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [org, setOrg] = useState('AI Society');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
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
    specificUser.orgs && specificUser.orgs.includes(org)
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setOrg(searchText);
  };

  return (
    <div className={styles.feedContainer}>
      <h1 className={styles.title}>User Directory by organizationss</h1>
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search users by organization"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>
        <div className={styles.resultsCount}>
          Results: {filteredUsers.length}
        </div>
      </div>
      <div className={styles.userList}>
        {loading ? (
          <div className={styles.loadingSpinner}></div>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : (
          filteredUsers.map((specificUser, index) => (
            <div key={index} className={styles.userCard}>
              <div className={styles.userHeader}>
                <ProfileImage username={specificUser.username} size='large' />
                <div className={styles.userMainInfo}>
                  <h3 className={styles.username}>{specificUser.username}</h3>
                  <p className={styles.userType}>
                    <User size={16} />
                    {specificUser.user_type}
                  </p>
                </div>
              </div>
              <div className={styles.userDetails}>
                <p>
                  <Mail size={16} />
                  {specificUser.email}
                </p>
                <p>
                  <Tag size={16} />
                  {specificUser.interests ? specificUser.interests.join(', ') : 'No interests listed'}
                </p>
                <p>
                  <Briefcase size={16} />
                  {specificUser.orgs ? specificUser.orgs.join(', ') : 'No orgs listed'}
                </p>
              </div>
              <button className={styles.viewProfileButton} onClick={() => navigate(`/profile/${specificUser.username}`)}>
                View Profile
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;