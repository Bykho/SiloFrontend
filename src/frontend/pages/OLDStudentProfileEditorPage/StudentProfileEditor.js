


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './studentProfileEditor.module.css';
import EditInfoTab from './EditInfoTab';
import config from '../../config';

function StudentProfileEditor({ initLocalData, setUserData, onSave }) {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [localState, setLocalState] = useState(initLocalData);
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
          resume: URL.createObjectURL(file) // Store the file URL for display
        }));
      }
    } else if (field === 'interests' || field === 'skills' || field === 'papers' || field === 'links') {
      setLocalState({ ...localState, [field]: e.target.value.split(',').map(item => item.trim()) });
    } else {
      setLocalState({ ...localState, [field]: e.target.value });
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
          interests: data.summary.interests || prevState.interests,
          skills: data.summary.skills || prevState.skills,
          university: data.summary.latestUniversity || prevState.university,
          major: data.summary.major || prevState.major,
          grad: data.summary.grad_yr || prevState.grad,
          // You might want to handle projects separately if needed
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

    // Append all form fields to formData
    Object.keys(localState).forEach(key => {
      if (key === 'interests' || key === 'skills' || key === 'papers' || key === 'links') {
        formData.append(key, JSON.stringify(localState[key]));
      } else {
        formData.append(key, localState[key]);
      }
    });

    // Append the new resume file if it exists
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
      updateUser(data.user);
      setUserData(prevState => ({ ...prevState, ...data.user }));
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



