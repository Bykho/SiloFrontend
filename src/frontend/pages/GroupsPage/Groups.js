

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GroupsSidebar from './GroupsSidebar';
import GroupDisplay from './GroupDisplay'; // Import GroupDisplay component
import styles from './groups.module.css';
import config from '../../config';
import { FaPlus } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';
import GroupsFeed from './GroupsFeed';

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('discover');
  const [projects, setProjects] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();
  const searchInputRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchText(inputText);
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.searchBar}>
        {activeGroup && <GroupDisplay group={activeGroup}/>}
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
          {activeGroup && <GroupsFeed group={activeGroup} />}
          {!activeGroup && <h1 className={styles.comingSoon}>Holder before group is selected...</h1>}
        </div>
      </div>
    </div>
  );
};

export default Groups;




