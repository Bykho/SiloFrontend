


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './studentProfileEditor.module.css';
import EditInfoTab from './EditInfoTab';
import config from '../../config';

function StudentProfileEditor({ initLocalData, setUserData, onSave }) {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [localState, setLocalState] = useState(() => {
    const processedData = { ...initLocalData };
    ['interests', 'skills', 'papers', 'links'].forEach(field => {
      if (Array.isArray(processedData[field])) {
        processedData[field] = processedData[field].join(', ');
      }
    });
    return processedData;
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState(null);

  const handleInputChange = (e, field) => {
    if (field === 'resume') {
      const file = e.target.files[0];
      if (file) {
        setNewResumeFile(file);
        setLocalState(prevState => ({
          ...prevState,
          resume: URL.createObjectURL(file)
        }));
      }
    } else {
      setLocalState(prevState => ({
        ...prevState,
        [field]: e.target.value
      }));
    }
  };

  const handleResumeUpload = async () => {
    if (!newResumeFile) {
      setError('No resume file selected');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', newResumeFile);

    try {
      const response = await fetch(`${config.apiBaseUrl}/groqResumeParser`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      
      if (data.summary) {
        setLocalState(prevState => ({
          ...prevState,
          biography: data.summary.bio || prevState.biography,
          interests: Array.isArray(data.summary.interests) ? data.summary.interests.join(', ') : data.summary.interests || prevState.interests,
          skills: Array.isArray(data.summary.skills) ? data.summary.skills.join(', ') : data.summary.skills || prevState.skills,
          university: data.summary.latestUniversity || prevState.university,
          major: data.summary.major || prevState.major,
          grad: data.summary.grad_yr || prevState.grad,
        }));
      } else {
        setError('No summary data received from the server');
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      setError(error.message || 'Failed to parse resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Create a copy of localState with arrays for specific fields
    const processedState = { ...localState };
    ['interests', 'skills', 'papers', 'links'].forEach(field => {
      if (localState[field]) {
        processedState[field] = localState[field].split(',').map(item => item.trim()).filter(Boolean);
      } else {
        processedState[field] = []; // Set to empty array if field is undefined
      }
    });

    Object.keys(processedState).forEach(key => {
      if (Array.isArray(processedState[key])) {
        formData.append(key, JSON.stringify(processedState[key]));
      } else {
        formData.append(key, processedState[key]);
      }
    });
    
    if (newResumeFile) {
      formData.append('resume', newResumeFile);
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/studentProfileEditor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setError('Profile updated successfully');
      // Update the local state and parent components with the processed state
      updateUser(processedState);
      setUserData(prevState => ({ ...prevState, ...processedState }));
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      onSave(data.access_token);
    } catch (err) {
      console.error('Failed to connect to the server:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
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
          isLoading={isLoading}
        />
        {newResumeFile && (
          <button 
            onClick={handleResumeUpload}
            className={styles.autofillButton}
            disabled={isLoading}
          >
            {isLoading ? 'Parsing Resume...' : 'Autofill from Resume'}
          </button>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}

export default StudentProfileEditor;



