

import React, { useState, useEffect } from 'react';
import { Search, Users, Compass, Star, ChevronRight } from 'lucide-react';
import styles from './groupssidebar.module.css';
import config from '../../config';

const SidebarItem = ({ icon, text, onClick, isActive, count }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <div className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>{icon}</span>
      <span className={styles.sidebarText}>{text}</span>
    </div>
  </li>
);

const GroupItem = ({ name, members, onClick, joinable = false, onJoin }) => (
  <li className={styles.groupItem} onClick={onClick}>
    <div className={styles.groupInfo}>
      <span className={styles.groupName}>{name}</span>
      <span className={styles.groupMembers}>{members} members</span>
    </div>
    {joinable && <button className={styles.joinButton} onClick={onJoin}>Join</button>}
    {!joinable && <ChevronRight className={styles.groupArrow} />}
  </li>
);

const GroupsSidebar = ({ feedStyle, setFeedStyle, activeGroup, setActiveGroup, isLoading, setIsLoading }) => {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        let response;
        if (feedStyle === 'discover' || feedStyle === 'suggested') {
          response = await fetch(`${config.apiBaseUrl}/returnGroups`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } else if (feedStyle === 'mygroups') {
          response = await fetch(`${config.apiBaseUrl}/returnMyGroups`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const returnedGroups = await response.json();
        setGroupList(returnedGroups);
        setIsLoading(false);
      } catch (err) {
        console.error(err.message);
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, [feedStyle, setIsLoading]);

  useEffect(() => {
    if (!isLoading && groupList.length > 0) {
      setActiveGroup(groupList[0]);
    }
  }, [isLoading, groupList, setActiveGroup]);

  const handleGroupJoin = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/joinGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      if (!response.ok) {
        throw new Error('Failed to join group');
      }
      const result = await response.json();
      console.log('Successfully joined group:', result);
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  return (
    <div className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <SidebarItem
          icon={<Users size={20} />}
          text="My Groups"
          onClick={() => setFeedStyle('mygroups')}
          isActive={feedStyle === 'mygroups'}
          count={groupList.length}
        />
        <SidebarItem
          icon={<Compass size={20} />}
          text="Discover Groups"
          onClick={() => setFeedStyle('discover')}
          isActive={feedStyle === 'discover'}
        />
        <SidebarItem
          icon={<Star size={20} />}
          text="Suggested Groups"
          onClick={() => setFeedStyle('suggested')}
          isActive={feedStyle === 'suggested'}
          count={groupList.length}
        />
      </nav>

      <div className={styles.groupsList}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search groups..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {feedStyle === 'mygroups' && (
              <ul>
                {groupList.map((group, index) => (
                  <GroupItem
                    key={index}
                    name={group.name}
                    members={group.members}
                    onClick={() => setActiveGroup(group)}
                  />
                ))}
              </ul>
            )}
            {feedStyle === 'discover' && (
              <div className={styles.discoverSection}>
                <ul>
                  {groupList.map((group, index) => (
                    <GroupItem
                      key={index}
                      name={group.name}
                      members={group.members}
                      onClick={() => setActiveGroup(group)}
                      joinable={true}
                      onJoin={() => handleGroupJoin(group._id)}
                    />
                  ))}
                </ul>
              </div>
            )}
            {feedStyle === 'suggested' && (
              <ul>
                {groupList.map((group, index) => (
                  <GroupItem
                    key={index}
                    name={group.name}
                    members={group.members}
                    onClick={() => setActiveGroup(group)}
                    joinable={true}
                    onJoin={() => handleGroupJoin(group._id)}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupsSidebar;




