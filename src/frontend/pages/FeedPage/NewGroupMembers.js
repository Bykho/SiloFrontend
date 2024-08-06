

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './newGroupMembers.module.css';
import UserCard from '../../components/UserCard';
import config from '../../config';

const GroupMembers = ({ group }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/getUsersByIds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: group.users }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const membersData = await response.json();
        setMembers(membersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch members');
        setLoading(false);
      }
    };
    fetchMembers();
  }, [group.users]);

  return (
    <div className={styles.groupMembersContainer}>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <ul className={styles.membersList}>
          {members.map((member) => (
            <li key={member._id} className={styles.memberItem}>
              <UserCard user={member} />
            </li>
          ))}
        </ul>
      )}
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


