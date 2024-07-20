


import React from 'react';
import PropTypes from 'prop-types';
import styles from './groupMembers.module.css';

const GroupMembers = ({ group }) => {
  return (
    <div className={styles.groupMembersContainer}>
      <h2 className={styles.groupTitle}>Members of {group.name}</h2>
      <ul className={styles.membersList}>
        {group.users.map((userId, index) => (
          <li key={index} className={styles.memberItem}>{userId}</li>
        ))}
      </ul>
    </div>
  );
};

GroupMembers.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default GroupMembers;


