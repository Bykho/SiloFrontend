



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './studentProfileEditor.module.css'; // Import the CSS module
import EditInfoTab from './EditInfoTab';
import config from '../../config';

function StudentProfileEditor({ initLocalData }) {
  console.log('init local data for student profile editor: ', initLocalData);
  const navigate = useNavigate(); // Initialize navigate
  const { updateUser } = useUser();
  const [localState, setLocalState] = useState(initLocalData);
  const [error, setError] = useState('');

  const handleInputChange = (e, field) => {
    if (field === 'interests' || field === 'skills' || field === 'papers' || field === 'links') {
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

    console.log('localStateSubset: ', localStateSubset)
    try {
      const response = await fetch(`${config.apiBaseUrl}/studentProfileEditor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(localStateSubset) // Send only the subset of localState
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setError('Profile updated successfully');
        updateUser(localStateSubset);
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
        }
      }
    } catch (err) {
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
      </div>
      <div className={styles.currentInfo}>
        <h1>Current Info:</h1>
        <p>Username: {localState.username || 'N/A'}</p>
        <p>Email: {localState.email || 'N/A'}</p>
        <p>University: {localState.university || 'N/A'}</p>
        <p>Interests: {localState.interests ? localState.interests.join(', ') : 'N/A'}</p>
        <p>Skills: {localState.skills ? localState.skills.join(', ') : 'N/A'}</p>
        <p>Biography: {localState.biography || 'N/A'}</p>
        <p>Personal Website: {localState.personal_website || 'N/A'}</p>
        <p>Github Link: {localState.github_link || 'N/A'}</p>
        <p>Papers Link: {localState.papers || 'N/A'}</p>
        <p>Resume <embed src={localState.resume} type="application/pdf" width="100%" height="500px" /> </p>
        <p>Links: {localState.links || 'N/A'}</p>
      </div>
    </div>
  );
}

export default StudentProfileEditor;




