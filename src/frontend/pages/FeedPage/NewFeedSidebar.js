import React, { useState, useEffect } from 'react';
import { Flame, Home, Search, Users, ChevronDown, ChevronRight, Sparkles, X } from 'lucide-react';
import { BiUpvote } from "react-icons/bi";
import styles from './newFeedSidebar.module.css';
import config from '../../config';
import { FaPlusCircle } from "react-icons/fa";


const SidebarItem = ({ Icon, text, onClick, isActive }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <Icon size={20} />
    <span>{text}</span>
  </li>
);

const GroupItem = ({ name, members, onClick, joinable = false, joined = false, onJoin, onLeave, isActive }) => (
  <li className={`${styles.groupItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <div className={styles.groupInfo}>
      <div className={styles.groupIcon}>
        <Users size={16} />
      </div>
      <div className={styles.groupDetails}>
        <span className={styles.groupName}>{name}</span>
      </div>
    </div>
    <div className={styles.joinButtonContainer}>
      {joinable && !joined && (
        <button className={styles.joinButton} onClick={(e) => { e.stopPropagation(); onJoin(); }}>
          Join
        </button>
      )}
      {joinable && joined && <span className={styles.joinedStatus}>Joined</span>}
      {!joinable && (
        <button className={styles.leaveButton} onClick={(e) => { e.stopPropagation(); onLeave(); }}>
          Leave
        </button>
      )}
    </div>
  </li>
);

const GroupSection = ({ title, groups, joinable, joinedGroups, onJoin, onLeave, setActiveGroup, setFeedStyle, activeGroup }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.groupSection}>
      <h3 className={styles.groupsSubHeader} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
      </h3>
      {isOpen && (
        <ul className={styles.groupList}>
          {groups.map((group, index) => (
              <GroupItem
              key={group._id}
              name={group.name}
              members={group.members}
              onClick={() => {
                setActiveGroup(group);
                setFeedStyle('groupView');
              }}
              joinable={joinable}
              joined={joinable ? joinedGroups.includes(group._id) : true}
              onJoin={() => onJoin(group._id)}
              onLeave={() => onLeave(group._id)}
              isActive={activeGroup && activeGroup._id === group._id}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const CombinedFeedSidebar = ({ feedStyle, setFeedStyle, activeGroup, setActiveGroup }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [filteredMyGroups, setFilteredMyGroups] = useState([]);
  const [filteredSuggestedGroups, setFilteredSuggestedGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    console.log("UseEffect for activeGroup: ", activeGroup)
  }, [activeGroup] )
  
  useEffect(() => {
    console.log("UseEffect for feedstyle: ", feedStyle)
  }, [feedStyle] )

  
  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnMyGroups`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch my groups');
        const returnedGroups = await response.json();
        setMyGroups(returnedGroups);
        setJoinedGroups(returnedGroups.map(group => group._id));
        setFilteredMyGroups(returnedGroups);
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchSuggestedGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnGroups`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch groups');
        const returnedGroups = await response.json();
        const filteredGroups = returnedGroups.filter(group => !myGroups.some(myGroup => myGroup._id === group._id));
        setSuggestedGroups(filteredGroups);
        setFilteredSuggestedGroups(filteredGroups);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchMyGroups();
    fetchSuggestedGroups();
  }, []);

  useEffect(() => {
    const filterGroups = () => {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredMyGroups(myGroups.filter(group => group.name.toLowerCase().includes(lowerQuery)));
      setFilteredSuggestedGroups(suggestedGroups.filter(group => group.name.toLowerCase().includes(lowerQuery)));
    };
    filterGroups();
  }, [searchQuery, myGroups, suggestedGroups]);

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
      if (!response.ok) throw new Error('Failed to join group');
      const result = await response.json();
      setJoinedGroups([...joinedGroups, groupId]);
      const newGroup = suggestedGroups.find(group => group._id === groupId);
      if (newGroup) {
        setMyGroups([...myGroups, newGroup]);
        setSuggestedGroups(suggestedGroups.filter(group => group._id !== groupId));
        setActiveGroup(newGroup);
      }
      console.log('Successfully joined group:', result);
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const handleGroupLeave = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/leaveGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      if (!response.ok) throw new Error('Failed to leave group');
      const result = await response.json();

      // Remove the group from myGroups
      const updatedMyGroups = myGroups.filter(group => group._id !== groupId);
      setMyGroups(updatedMyGroups);

      // Add the group back to suggestedGroups
      const leftGroup = myGroups.find(group => group._id === groupId);
      if (leftGroup) {
        setSuggestedGroups([...suggestedGroups, leftGroup]);
      }

      // Update joinedGroups state
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));

      // Reset activeGroup and feedStyle if necessary
      if (activeGroup && activeGroup._id === groupId) {
        setActiveGroup(null);
        setFeedStyle('home'); // or 'suggested' if you prefer
      }

      console.log('Successfully left group:', result);
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };
  
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/groupCreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupName: newGroupName, groupDescription: newGroupDescription, groupProject_Content: [] }),
      });
      const result = await response.json();
      const newGroup = {
        _id: result.group.id, // Use the ID returned from the backend
        name: result.group.name,
        description: result.group.description,
        users: result.group.users,
        projects: result.group.projects
      };
      setMyGroups([...myGroups, newGroup]);
      setJoinedGroups([...joinedGroups, result.group_id]);
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };


  return (
    <div className={styles.sidebar}>
      <ul className={styles.sidebarMenu}>
        <SidebarItem Icon={Sparkles} text="Suggested" onClick={() => setFeedStyle('suggested')} isActive={feedStyle === 'suggested'} />
        <SidebarItem Icon={Flame} text="Popular" onClick={() => setFeedStyle('popular')} isActive={feedStyle === 'popular'} />
        <SidebarItem Icon={BiUpvote} text="My Upvotes" onClick={() => setFeedStyle('upvoted')} isActive={feedStyle === 'upvoted'} />
      </ul>
      <div className={styles.divider}></div>
      <h2 className={styles.groupsHeader}>
        <Users size={20} />
        <span>Communities</span>
        <button className={styles.createGroupButton} onClick={() => setIsModalOpen(true)}> <FaPlusCircle /> Create</button>

      </h2>
      <div className={styles.searchContainer}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={styles.groupsList}>
        <GroupSection
          title="Your Communities"
          groups={filteredMyGroups}
          joinable={false}
          onLeave={handleGroupLeave}
          setActiveGroup={setActiveGroup}
          setFeedStyle={setFeedStyle}
          activeGroup={activeGroup}
        />
        <GroupSection
          title="Suggested Communities"
          groups={filteredSuggestedGroups}
          joinable={true}
          joinedGroups={joinedGroups}
          onJoin={handleGroupJoin}
          setActiveGroup={setActiveGroup}
          setFeedStyle={setFeedStyle}
          activeGroup={activeGroup}
        />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className={`${styles.input} ${!newGroupName.trim() && styles.inputError}`}
                  required
                />
                {!newGroupName.trim() && <span className={styles.errorMessage}>Group name is required</span>}
              </div>
              <textarea
                placeholder="Enter group description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className={styles.input}
                required
              />
              <button 
                type="submit" 
                className={`${styles.submitButton} ${!newGroupName.trim() && styles.submitButtonDisabled}`}
                disabled={!newGroupName.trim()}
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedFeedSidebar;