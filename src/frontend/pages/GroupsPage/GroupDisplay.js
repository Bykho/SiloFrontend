

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './groupDisplay.module.css';
import { FaUserGroup, FaPlus } from 'react-icons/fa6';
import AddProjectToGroup from './AddProjectToGroup';
import Tagged from '../../components/TagsFeed';
import config from '../../config';

const GroupDisplay = ({ group }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showAddProjectToGroup, setShowAddProjectToGroup] = useState(false);
  const [fullProjects, setFullProjects] = useState([]);

  const toggleMembersView = () => {
    setShowMembers(!showMembers);
  };

  const toggleAddProjectToGroupView = () => {
    setShowAddProjectToGroup(!showAddProjectToGroup);
  };

  useEffect(() => {
    const fetchProjectsFromIds = async () => {
      console.log('here is fetchProjectsFromIds: ', group.projects )
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
        console.log('here are returnedProjects in the fetchProjectFromIds', returnedProjects)
        setFullProjects(returnedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjectsFromIds();
  }, []);


  useEffect (() => {
    console.log('here is the group in groupdisplay: ', group);
    console.log('here are the returnedProjects (in full projects)', fullProjects);
  }, [fullProjects])

  if (!group) {
    return <div className={styles.noGroup}>No group selected.</div>;
  }

  return (
    <div className={styles.groupContainer}>
      <h1 className={styles.groupTitle}>Name: {group.name}</h1>
      <p className={styles.groupDescription}>Description: {group.description}</p>
      <p className={styles.groupDescription}>Group Members: {group.members}</p>
      <p className={styles.groupDescription}>Created By: {group.createdBy}</p>
      {group.users && group.users.length > 0 && (
        <button className={styles.groupButton} onClick={toggleMembersView}>
          <FaUserGroup /> {showMembers ? 'Hide Members' : 'View Members'}
        </button>
      )}
      {showMembers && group.users && (
        <ul className={styles.membersList}>
          {group.users.map((userId, index) => (
            <li key={index} className={styles.memberItem}>{userId}</li>
          ))}
        </ul>
      )}
      <button className={styles.groupButton} onClick={toggleAddProjectToGroupView}>
        <FaPlus /> Add Project to Group
      </button>
      {showAddProjectToGroup && (
        <div className={styles.modalOverlay}>
          <AddProjectToGroup group={group} onClose={toggleAddProjectToGroupView} />
        </div>
      )}
    </div>
  );
};


export default GroupDisplay;




