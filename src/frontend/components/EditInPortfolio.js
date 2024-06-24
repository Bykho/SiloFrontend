



import React, { useState } from 'react';
import styles from './editInPortfolio.module.css';
import config from '../config'


const EditInPortfolio = ({ project, projectField, project_id, updateProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(project[projectField]);
  const [error, setError] = useState('');

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
        updateProject(projectField, newValue);
        setIsEditing(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Update failed');
      }
    } catch (error) {
      setError('Error during update: ' + error.message);
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
          {error && <div className={styles.error}>{error}</div>}
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




