



import React, { useState } from 'react';
import styles from './editInPortfolio.module.css';

import config from '../config';

const EditInPortfolio = ({ project, projectField, project_id, user, updateProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(project[projectField]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setNewValue(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/updateProject/${project_id}/${projectField}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [projectField]: newValue })
      });
      if (response.ok) {
        updateProject(project_id, projectField, newValue);
        setIsEditing(false);
      } else {
        console.error('Update failed');
      }
    } catch (error) {
      console.error('Error during update:', error);
    }
  };

  return (
    <div className={styles.editContainer}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newValue}
            onChange={handleInputChange}
            className={styles.editInput}
          />
          <button onClick={handleSubmit} className={styles.submitButton}>
            Submit
          </button>
        </div>
      ) : (
        <div onClick={handleEditClick} className={styles.editButton}>
          Edit?
        </div>
      )}
    </div>
  );
};

export default EditInPortfolio;




