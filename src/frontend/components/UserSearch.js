


import React, { useState, useEffect, useRef } from 'react';
import styles from './userSearch.module.css';
import { useUser } from '../contexts/UserContext';
import ProfileImage from './ProfileImage';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';
import { FaAward } from 'react-icons/fa';
import { Search, User, Briefcase, Mail, Tag } from 'lucide-react';
import LeaderboardView from './LeaderboardView';


const UserSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [value, setValue] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isLeaderboardView, setIsLeaderboardView] = useState(false);

  useEffect(() => {
    if (location.state && location.state.skill) {
      setSearchText(location.state.skill);
      setValue(location.state.skill);
      searchInputRef.current.focus();
      handleSearch({ preventDefault: () => {} });
      navigate('/GenDirectory', { replace: true }); // Remove the state from the URL
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/userFilteredSearch/${value}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const userData = await response.json();
        console.log('userData: ', userData); 
        setUsers(userData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [value]);

  const fetchProjectsForUser = async (portfolio) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectIds: portfolio }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projectData = await response.json();
      return projectData;
    } catch (err) {
      throw new Error('Failed to fetch projects');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText === ' ') {
      setValue('all');
    }
    setValue(searchText || 'all'); // Use 'student' if searchText is empty
  };

  const toggleView = () => {
    setIsLeaderboardView(!isLeaderboardView);
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search users"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>
        <div className={styles.viewToggle}>
          <span className={`${styles.viewLabel} ${!isLeaderboardView ? styles.activeView : ''}`}>Cards</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isLeaderboardView}
              onChange={toggleView}
              aria-label="Toggle between card view and leaderboard view"
            />
            <span className={styles.slider}></span>
          </label>
          <span className={`${styles.viewLabel} ${isLeaderboardView ? styles.activeView : ''}`}>Leaderboard</span>
        </div>

      </div>
      {loading ? (
        <div className={styles.loadingSpinner}></div>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : isLeaderboardView ? (
        <LeaderboardView users={users.map(user => ({...user, score: user.totalUpvotes * 10}))} navigate={navigate} fetchProjectsForUser={fetchProjectsForUser} />
      ) : (
        <div className={styles.userList}>
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              navigate={navigate}
              fetchProjectsForUser={fetchProjectsForUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, navigate, fetchProjectsForUser }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUpvotes, setTotalUpvotes] = useState(0);
  const [score, setScore] = useState(0);

  console.log('USERCARD here is user: ', user)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const projectData = await fetchProjectsForUser(user.portfolio);
        setProjects(projectData);

        const upvotesSum = projectData.reduce(
          (sum, project) => sum + (project.upvotes ? project.upvotes.length : 0),
          0
        );
        setTotalUpvotes(upvotesSum);
  
        let tempScore = user.scores.length > 0
          ? Object.values(user.scores[user.scores.length - 1]).reduce(
              (sum, value) => sum + value,
              0
            )
          : 0;
  
        tempScore += upvotesSum * 10;
        setScore(tempScore);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user.portfolio, fetchProjectsForUser]);

  return (
    <div className={styles.userCard}>
      <div className={styles.userHeader}>
        <ProfileImage username={user.username} size='large' />
        <div className={styles.userMainInfo}>
          <h3 className={styles.username}>{user.username}</h3>
          <p className={styles.userType}>
            <User size={16} />
            {user.user_type}
          </p>
        </div>
      </div>
      <div className={styles.userDetails}>
        <p className={styles.score}>
          <FaAward className={styles.scoreIcon}/> Score: {score}
        </p>
        <p>
          <Mail size={16} />
          {user.email}
        </p>
        <p>
          <Tag size={16} />
          {user.interests ? user.interests.join(', ') : 'No interests listed'}
        </p>
      </div>
      <button className={styles.viewProfileButton} onClick={() => navigate(`/profile/${user._id}`)}>
        View Profile
      </button>
    </div>
  );
};

export default UserSearch;




