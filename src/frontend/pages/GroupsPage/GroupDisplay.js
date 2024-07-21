

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './groupDisplay.module.css';
import { FaPlus, FaUser, FaInfoCircle } from 'react-icons/fa';
import { FaUserGroup } from "react-icons/fa6";
import AddProjectToGroup from './AddProjectToGroup';
import config from '../../config';
import GroupCreator from './GroupCreator'; // Import GroupCreator component

const GroupDisplay = ({ group, setGroupsDisplayStyle }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showAddProjectToGroup, setShowAddProjectToGroup] = useState(false);
  const [fullProjects, setFullProjects] = useState([]);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  
  useEffect(() => {
    console.log('GROUPDISPLAY group: ', group)
  }, [])
  
  const toggleAddProjectToGroupView = () => {
    setShowAddProjectToGroup(!showAddProjectToGroup);
  };

  const handleCreateGroupClick = () => {
    setShowGroupCreator(!showGroupCreator);
  };

  const handleInfoButtonClick = () => {
    setGroupsDisplayStyle('groupInfo');
    setShowMembers(false);
  };

  const handleProjectsButtonClick = () => {
    setGroupsDisplayStyle('projects');
    setShowMembers(false);
  };

  const handleMembersButtonClick = () => {
    setGroupsDisplayStyle('members');
    setShowMembers(true);
  };

  const handleDiscussionButtonClick = () => {
    setGroupsDisplayStyle('discussion');
    setShowMembers(false);
  };

  if (!group) {
    return <div className={styles.noGroup}>No group selected.</div>;
  }

  return (
    <div className={styles.groupDisplayContainer}>
      <div className={styles.groupHeader}>
        <div className={styles.groupTitleRow}>
          <h2 className={styles.groupTitle}>{group.name}</h2>
          <div>
          </div>
          <div className={styles.groupMetadata}>
            <span className={styles.groupMetadataItem}>
              <FaUser className={styles.icon} />
              Created by {group.createdBy}
            </span>
          </div>
          <button className={styles.createGroupButton} onClick={() => setShowGroupCreator(true)}>
            <FaPlus /> Create New Group
          </button>
        </div>
        <p className={styles.groupDescription} title={group.description}>
          <FaInfoCircle className={styles.icon} />
          {group.description}
        </p>
      </div>

      <div className={styles.groupButtonsContainer}>
        <button className={styles.groupButton} onClick={handleProjectsButtonClick}>
          <FaUserGroup /> View Projects
        </button>
        <button className={styles.groupButton} onClick={handleMembersButtonClick}>
          <FaUserGroup /> {showMembers ? 'Hide Members' : `View ${group.members} Members`}
        </button>
        <button className={styles.groupButton} onClick={handleDiscussionButtonClick}>
          <FaUserGroup /> Discussion Board
        </button>
        <button className={styles.addGroupButton} onClick={() => setShowAddProjectToGroup(true)}>
          <FaPlus /> Add Project to Group
        </button>      
      </div>

      {showMembers && group.users && (
        <ul className={styles.membersList}>
          {group.users.map((userId, index) => (
            <li key={index} className={styles.memberItem}>{userId}</li>
          ))}
          {'heres the project ids'}
          {group.projects.map((userId, index) => (
            <li key={index} className={styles.memberItem}>{userId}</li>
          ))}
        </ul>
      )}

      {showAddProjectToGroup && (
        <div className={styles.modalOverlay}>
          <AddProjectToGroup group={group} onClose={toggleAddProjectToGroupView} />
        </div>
      )}

      {showGroupCreator && (
        <div className={styles.modalOverlay}>
          <GroupCreator onClose={handleCreateGroupClick} />
        </div>
      )}
    </div>
  );
};

export default GroupDisplay;



