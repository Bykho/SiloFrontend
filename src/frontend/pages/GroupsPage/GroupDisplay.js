

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

  useEffect(() => {
    const fetchProjectsFromIds = async () => {
      //console.log('here is fetchProjectsFromIds: ', group.projects);
      console.log('GROUP DISPLAY here is group: ', group)
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ projectIds: group.projects }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const returnedProjects = await response.json();
        //console.log('here are returnedProjects in the fetchProjectFromIds', returnedProjects);
        setFullProjects(returnedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjectsFromIds();
  }, [group.projects]);

  //useEffect(() => {
    //console.log('here is the group in groupdisplay: ', group);
  //  console.log('here are the returnedProjects (in full projects)', fullProjects);
  //}, [fullProjects]);

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
        {/*
        <button className={styles.groupButton} onClick={handleInfoButtonClick}>
          <FaInfoCircle /> View Info
        </button>*/}
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


