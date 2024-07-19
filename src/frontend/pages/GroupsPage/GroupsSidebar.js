

import React, { useState, useEffect } from 'react';
import { Search, Users, Compass, Star, ChevronRight } from 'lucide-react';
import styles from './groupssidebar.module.css';
import config from '../../config';

const SidebarItem = ({ icon, text, onClick, isActive, count }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <div className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>{icon}</span>
      <span className={styles.sidebarText}>{text}</span>
      {/*{count && <span className={styles.sidebarCount}>{count}</span>}*/}
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

const GroupsSidebar = ({ feedStyle, setFeedStyle, activeGroup, setActiveGroup }) => {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    if (feedStyle === 'discover') {
      const fetchGroups = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.apiBaseUrl}/returnGroups`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch groups');
          }
          const returnedGroups = await response.json();
          setGroupList(returnedGroups);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchGroups();
    }
    if (feedStyle === 'mygroups') {
      const fetchGroups = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.apiBaseUrl}/returnMyGroups`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch groups');
          }
          const returnedGroups = await response.json();
          setGroupList(returnedGroups);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchGroups();
    }
    if (feedStyle === 'suggested') {
      const fetchGroups = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.apiBaseUrl}/returnGroups`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch groups');
          }
          const returnedGroups = await response.json();
          setGroupList(returnedGroups);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchGroups();
    }
  }, [feedStyle]);

  useEffect(() => {
    console.log('here are availableGroups: ', groupList);
  }, [groupList]);

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
      // Update the UI or state as needed to reflect the joined group
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const availableGroups = groupList.map((group) => ({
    id: group._id,
    name: group.name,
    description: group.description,
    createdBy: group.createdBy,
    project_content: group.project_content,
    members: group.users.length,
    users: group.users,
    projects: group.projects
  }));

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {activeGroup && (
          <div className={styles.currentGroup}>
            <h3>{activeGroup.name}</h3>
            <p>{activeGroup.members} members</p>
          </div>
        )}
      </div>

      <nav className={styles.sidebarNav}>
        <SidebarItem
          icon={<Users size={20} />}
          text="My Groups"
          onClick={() => setFeedStyle('mygroups')}
          isActive={feedStyle === 'mygroups'}
          count={availableGroups.length}
        />
        <SidebarItem
          icon={<Compass size={20} />}
          text="Discover"
          onClick={() => setFeedStyle('discover')}
          isActive={feedStyle === 'discover'}
        />
        <SidebarItem
          icon={<Star size={20} />}
          text="Suggested"
          onClick={() => setFeedStyle('suggested')}
          isActive={feedStyle === 'suggested'}
          count={availableGroups.length}
        />
      </nav>

      <div className={styles.groupsList}>
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
            {availableGroups.map((group, index) => (
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
              {availableGroups.map((group, index) => (
                <GroupItem
                  key={index}
                  name={group.name}
                  members={group.members}
                  onClick={() => setActiveGroup(group)}
                  joinable={true}
                  onJoin={() => handleGroupJoin(group.id)}
                />
              ))}
            </ul>
          </div>
        )}
        {feedStyle === 'suggested' && (
          <ul>
            {availableGroups.map((group, index) => (
              <GroupItem
                key={index}
                name={group.name}
                members={group.members}
                onClick={() => setActiveGroup(group)}
                joinable={true}
                onJoin={() => handleGroupJoin(group.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupsSidebar;



