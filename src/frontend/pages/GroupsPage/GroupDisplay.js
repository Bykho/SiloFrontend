

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './groupDisplay.module.css';
import { FaUserGroup, FaPlus } from 'react-icons/fa6';
import AddProjectToGroup from './AddProjectToGroup';

const GroupDisplay = ({ group }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showAddProjectToGroup, setShowAddProjectToGroup] = useState(false);

  const toggleMembersView = () => {
    setShowMembers(!showMembers);
  };

  const toggleAddProjectToGroupView = () => {
    setShowAddProjectToGroup(!showAddProjectToGroup);
  };

  console.log('here is the group in groupdisplay: ', group);
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

GroupDisplay.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired,
    members: PropTypes.number.isRequired,
    users: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default GroupDisplay;



