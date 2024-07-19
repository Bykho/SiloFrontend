

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import GroupsSidebar from './GroupsSidebar';
import GroupDisplay from './GroupDisplay'; // Import GroupDisplay component
import styles from './groups.module.css';
import GroupsFeed from './GroupsFeed';

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('mygroups');
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
      <div className={styles.topBar}>
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




