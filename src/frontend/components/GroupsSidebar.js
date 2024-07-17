import React, { useState } from 'react';
import { Search, Users, Compass, Star, ChevronRight } from 'lucide-react';
import styles from './groupssidebar.module.css';

const SidebarItem = ({ icon, text, onClick, isActive, count }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <div className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>{icon}</span>
      <span className={styles.sidebarText}>{text}</span>
      {count && <span className={styles.sidebarCount}>{count}</span>}
    </div>
  </li>
);

const GroupItem = ({ name, members, onClick, joinable = false }) => (
  <li className={styles.groupItem} onClick={onClick}>
    <div className={styles.groupInfo}>
      <span className={styles.groupName}>{name}</span>
      <span className={styles.groupMembers}>{members} members</span>
    </div>
    {joinable && <button className={styles.joinButton}>Join</button>}
    {!joinable && <ChevronRight className={styles.groupArrow} />}
  </li>
);

const GroupsSidebar = () => {
  const [activeSection, setActiveSection] = useState('myGroups');
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myGroups = [
    { name: 'Web Development', members: 1500 },
    { name: 'React Enthusiasts', members: 3200 },
    { name: 'UI/UX Design', members: 2800 }
  ];

  const suggestedGroups = [
    { name: 'JavaScript Ninjas', members: 5000 },
    { name: 'CSS Wizards', members: 4200 },
    { name: 'Tech Startups', members: 3800 }
  ];

  const handleGroupClick = (group) => {
    setCurrentGroup(group);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}> Groups</h2>
        {currentGroup && (
          <div className={styles.currentGroup}>
            <h3>{currentGroup.name}</h3>
            <p>{currentGroup.members} members</p>
          </div>
        )}
      </div>

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

      <nav className={styles.sidebarNav}>
        <SidebarItem
          icon={<Users size={20} />}
          text="My Groups"
          onClick={() => setActiveSection('myGroups')}
          isActive={activeSection === 'myGroups'}
          count={myGroups.length}
        />
        <SidebarItem
          icon={<Compass size={20} />}
          text="Discover"
          onClick={() => setActiveSection('discover')}
          isActive={activeSection === 'discover'}
        />
        <SidebarItem
          icon={<Star size={20} />}
          text="Suggested"
          onClick={() => setActiveSection('suggested')}
          isActive={activeSection === 'suggested'}
          count={suggestedGroups.length}
        />
      </nav>

      <div className={styles.groupsList}>
        {activeSection === 'myGroups' && (
          <ul>
            {myGroups.map((group, index) => (
              <GroupItem
                key={index}
                name={group.name}
                members={group.members}
                onClick={() => handleGroupClick(group)}
              />
            ))}
          </ul>
        )}
        {activeSection === 'discover' && (
          <div className={styles.discoverSection}>
            <p>Explore new groups based on your interests</p>
            <ul>
              {searchQuery && (
                <GroupItem
                  name={`Results for "${searchQuery}"`}
                  members={1234}
                  joinable={true}
                />
              )}
              {/* Add more discover groups here */}
            </ul>
          </div>
        )}
        {activeSection === 'suggested' && (
          <ul>
            {suggestedGroups.map((group, index) => (
              <GroupItem
                key={index}
                name={group.name}
                members={group.members}
                joinable={true}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupsSidebar;