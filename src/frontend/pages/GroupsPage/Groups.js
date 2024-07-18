

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GroupsSidebar from './GroupsSidebar';
import GroupCreator from './GroupCreator'; // Import GroupCreator component
import GroupDisplay from './GroupDisplay'; // Import GroupDisplay component
import styles from './groups.module.css';
import config from '../../config';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('discover');
  const [projects, setProjects] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();
  const searchInputRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showGroupCreator, setShowGroupCreator] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchText(inputText);
  };

  const handleCreateGroupClick = () => {
    setShowGroupCreator(!showGroupCreator); // Toggle the state
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
            onClick={() => setFeedStyle('discover')}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Machine Learning"
            className={styles.searchInput}
          />
          <button className={styles.navButton} onClick={handleSearch}>Search</button>
        </div>
        <div className={styles.groupsButtons}>   
          <button className={styles.groupButton} onClick={handleCreateGroupClick}> <FaPlus /> Create Group </button>
          <button className={styles.groupButton} > <FaUserGroup /> View Members</button>
        </div>
      </div>

      <div className={styles.feedBottomContainer}>
        <div className={styles.feedSidebar}>
          <GroupsSidebar 
            feedStyle={feedStyle} 
            setFeedStyle={setFeedStyle} 
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup} 
          />
        </div>
        <div className={styles.feedContent}>
          { activeGroup && <GroupDisplay group={activeGroup} />}
          {!showGroupCreator && !activeGroup && <h1 className={styles.comingSoon}>Holder before group is selected...</h1>}
        </div>
      </div>
      {showGroupCreator && (
        <div className={styles.modalOverlay}>
          <GroupCreator onClose={handleCreateGroupClick} />
        </div>
      )}
    </div>
  );
};

export default Groups;





