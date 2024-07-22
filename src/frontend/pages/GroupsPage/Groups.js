


import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import GroupsSidebar from './GroupsSidebar';
import GroupDisplay from './GroupDisplay';
import styles from './groups.module.css';
import GroupsFeed from './GroupsFeed';
import GroupInfo from './GroupInfo';
import GroupMembers from './GroupMembers';
import DiscussionBoard from './DiscussionBoard'; // Import DiscussionBoard component

const Groups = () => {
  const [feedStyle, setFeedStyle] = useState('mygroups');
  const [groupsDisplayStyle, setGroupsDisplayStyle ] = useState('projects')
  const [projects, setProjects] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const { user } = useUser();
  const searchInputRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
        <div className={styles.feedContent}>
          {!isLoading && activeGroup && groupsDisplayStyle === 'projects' && <GroupsFeed group={activeGroup} />}
          {!isLoading && activeGroup && groupsDisplayStyle === 'groupInfo' && <GroupInfo group={activeGroup} />}
          {!isLoading && activeGroup && groupsDisplayStyle === 'members' && <GroupMembers group={activeGroup} />}
          {!isLoading && activeGroup && groupsDisplayStyle === 'discussion' && <DiscussionBoard group={activeGroup} />}
          {!activeGroup && <h1 className={styles.comingSoon}></h1>}
        </div>
      </div>
    </div>
  );
};

export default Groups;



