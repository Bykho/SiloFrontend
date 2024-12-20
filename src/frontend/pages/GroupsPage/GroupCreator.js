


import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './groupCreator.module.css';
import config from '../../config';

const GroupCreator = ({ onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [projectContent, setProjectContent] = useState({
    classMaterials: '',
    externalResources: '',
    faqs: '',
    discussionBoard: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectContent((prevContent) => ({
      ...prevContent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const groupData = {
      groupName,
      groupDescription,
      groupProject_Content : projectContent
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/groupCreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        alert('Group created successfully');
        onClose();
      } else {
        console.error('Failed to create group:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h1 style={{ color: 'white' }}>Create a group</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            required
            className={styles.input}
          />
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Group Description"
            required
            className={styles.textarea}
          />
          <button type="submit" className={styles.saveButton}>Save</button>
        </form>
      </div>
    </div>
  );
};

GroupCreator.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default GroupCreator;



