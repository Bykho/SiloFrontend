


import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import GroupsSidebar from './GroupsSidebar';
import GroupDisplay from './GroupDisplay';
import styles from './groups.module.css';
import GroupsFeed from './GroupsFeed';
import GroupInfo from './GroupInfo';
import GroupMembers from './GroupMembers'; // Import GroupMembers component

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('mygroups');
  const [groupsDisplayStyle, setGroupsDisplayStyle ] = useState('projects')
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
        {activeGroup && <GroupDisplay group={activeGroup} setGroupsDisplayStyle={setGroupsDisplayStyle}/>}
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
          {activeGroup && groupsDisplayStyle === 'projects' && <GroupsFeed group={activeGroup} />}
          {activeGroup && groupsDisplayStyle === 'groupInfo' && <GroupInfo group={activeGroup} />}
          {activeGroup && groupsDisplayStyle === 'members' && <GroupMembers group={activeGroup} />}
          {!activeGroup && <h1 className={styles.comingSoon}>Holder before group is selected...</h1>}
        </div>
      </div>
    </div>
  );
};

export default Groups;



