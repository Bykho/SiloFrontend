

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './groupInfo.module.css';
import { useUser } from '../../contexts/UserContext';

const GroupInfo = ({ group }) => {
  const { user } = useUser();
  const isCreator = user.username === group.createdBy;
  const [description, setDescription] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupUsers, setGroupUsers] = useState([]);
  const [projectContent, setProjectContent] = useState({
    classMaterials: '',
    externalResources: '',
    faqs: '',
    discussionBoard: '',
  });

  useEffect(() => {
    if (isCreator) {
      setDescription(group.groupDescription);
      setGroupName(group.name);
      setGroupUsers(group.users);
      setProjectContent(group.project_content);
    }
  }, [isCreator, group]);

  return (
    <div className={styles.groupInfoContainer}>
      <div>
        <h2 className={styles.groupName}>{group.name}</h2>
      </div>
      <div>
        {isCreator ? 'You created this' : 'Someone else\'s group'}
      </div>
      {isCreator && (
        <div>
          <div className={styles.inputField}>
            Group Name: {groupName}
          </div>
          <div className={styles.inputField}>
            Description: {description}
          </div>
          <div className={styles.inputField}>
            Class Materials: {projectContent.classMaterials}
          </div>
          <div className={styles.inputField}>
            External Resources: {projectContent.externalResources}
          </div>
          <div className={styles.inputField}>
            FAQs: {projectContent.faqs}
          </div>
          <div className={styles.inputField}>
            Discussion Board: {projectContent.discussionBoard}
          </div>
        </div>
      )}
      <div>
        Users: {groupUsers.join(', ')}
      </div>
    </div>
  );
};

export default GroupInfo;

