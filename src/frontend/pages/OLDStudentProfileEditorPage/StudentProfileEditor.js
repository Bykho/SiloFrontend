


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './studentProfileEditor.module.css';
import EditInfoTab from './EditInfoTab';
import config from '../../config';

function StudentProfileEditor({ initLocalData, setUserData, onSave }) {
  console.log('init local data for student profile editor: ', initLocalData);
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [localState, setLocalState] = useState(initLocalData);
  const [error, setError] = useState('');

  const handleInputChange = (e, field) => {
    if (field === 'resume') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLocalState({ ...localState, resume: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } else if (field === 'interests' || field === 'skills' || field === 'papers' || field === 'links') {
      setLocalState({ ...localState, [field]: e.target.value.split(',').map(item => item.trim()) });
    } else {
      setLocalState({ ...localState, [field]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const subsetKeys = ['username', 'email', 'university', 'interests', 
      'skills', 'biography', 'profile_photo', 'personal_website', 'github_link', 
      'papers', 'resume', 'links'];
    const localStateSubset = subsetKeys.reduce((obj, key) => {
      if (localState[key]) {
        obj[key] = localState[key];
      }
      return obj;
    }, {});

    try {
      const response = await fetch(`${config.apiBaseUrl}/studentProfileEditor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(localStateSubset)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setError('Profile updated successfully');
        updateUser(localStateSubset);
        setUserData(prevState => ({ ...prevState, ...localStateSubset }));
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
        }
        // Call onSave to close the modal
        onSave(data.access_token);
      }
    } catch (err) {
      console.error('Failed to connect to the server:', err);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className={styles.boxContainer}>
      <div className={styles.profileEditorContainer}>
        <h1 className={styles.profileEditorTitle}>Student Profile Editor</h1>
        <EditInfoTab 
          localState={localState} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmit} 
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      <div className={styles.currentInfo}>
        <h2 className={styles.currentInfoTitle}>Current Info</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Username:</span>
            <span className={styles.infoValue}>{localState.username || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{localState.email || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>University:</span>
            <span className={styles.infoValue}>{localState.university || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Grad Year:</span>
            <span className={styles.infoValue}>{localState.grad || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Major:</span>
            <span className={styles.infoValue}>{localState.major || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Interests:</span>
            <span className={styles.infoValue}>{localState.interests ? localState.interests.join(', ') : 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Skills:</span>
            <span className={styles.infoValue}>{localState.skills ? localState.skills.join(', ') : 'N/A'}</span>
          </div>
          <div className={`${styles.infoItem} ${styles.fullWidth}`}>
            <span className={styles.infoLabel}>Biography:</span>
            <span className={styles.infoValue}>{localState.biography || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Personal Website:</span>
            <span className={styles.infoValue}>{localState.personal_website || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Github Link:</span>
            <span className={styles.infoValue}>{localState.github_link || 'N/A'}</span>
          </div>

        </div>
        {localState.resume && (
          <div className={`${styles.infoItem} ${styles.fullWidth}`}>
            <span className={styles.infoLabel}>Resume:</span>
            <embed src={localState.resume} type="application/pdf" width="100%" height="300px" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfileEditor;



