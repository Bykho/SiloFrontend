


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
      'papers', 'resume', 'links', 'major', 'grad'];
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
        <h1 className={styles.profileEditorTitle}>Edit My Info</h1>
        <EditInfoTab 
          localState={localState} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmit} 
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}

export default StudentProfileEditor;



