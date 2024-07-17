

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Tagged from '../../components/TagsFeed';
import GroupsSidebar from '../../components/GroupsSidebar';
import styles from './groups.module.css';
import config from '../../config';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('users');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [major, setMajor] = useState('Mechanical Engineering');
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const [majorList, setMajorList] = useState([]);
  const myGroupsList = ['Mechanical Engineering']; // Added this line

  useEffect(() => {
    const fetchUsers = async () => {
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
        const returnedUsers = await response.json();
        const majors = new Set();
        returnedUsers.forEach(user => {
          if (user.major) {
            majors.add(user.major);
          }
        });
        setMajorList(Array.from(majors));
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');

      if (feedStyle === 'projects') {
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
      } else if (feedStyle === 'users') {
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
          const returnedUsers = await response.json();
          setUsers(returnedUsers);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch users');
          setLoading(false);
        }
      }
    };
    fetchProjects();
  }, [feedStyle]);

  useEffect(() => {
    console.log('here is the feedStyle: ', feedStyle);
    console.log('here is search text: ', searchText);
    let filtered = [];

    if (feedStyle === 'projects') {
    } else if (feedStyle === 'users') {
      filtered = users.filter(individual => individual.major === major);
    }

    setFilteredProjects(filtered);
  }, [projects, feedStyle, users, major]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchText(inputText);
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.searchBar}>
        <div className={styles.searchWords}>
          <p style={{ textAlign: 'left' }}><FaSearch /></p>
        </div>
        <div className={styles.buttonContainer}>
          <input
            ref={searchInputRef}
            type="search"
            value={inputText}
            onClick={() => setFeedStyle('explore')}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Machine Learning"
            className={styles.searchInput}
          />
          <button className={styles.navButton} onClick={handleSearch}>Search</button>
        </div>
        <div className={styles.groupsButtons}>   
          <button className={styles.groupButton} > <FaPlus /> Create Group </button>
          <button className={styles.groupButton} > <FaUserGroup /> View Members</button>
        </div>
      </div>

      <div className={styles.feedBottomContainer}>
        <div className={styles.feedSidebar}>
          <GroupsSidebar feedStyle={feedStyle} groups={majorList} setFeedStyle={setFeedStyle} setMajor={setMajor} myGroups={myGroupsList} /> {/* Updated this line */}
        </div>
        <div className={styles.feedContent}>
          {/*<div className={styles.filteredProjectsContainer}>
            {filteredProjects.map((individual, index) => (
              <div key={index} className={styles.individualItem}>User: {individual.username} ---- major: {individual.major}</div>
            ))}
          </div>
          */}
        <h1 className={styles.comingSoon}>Coming soon...</h1>
        </div>
      </div>
    </div>
  );
};

export default Groups;


