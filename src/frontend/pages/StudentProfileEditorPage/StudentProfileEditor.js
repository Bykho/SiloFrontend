



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfileEditor.module.css'; // Import the CSS module
import EditInfoTab from './EditInfoTab';
import EditPortfolioTab from './EditPortfolioTab';

import config from '../../config';

function StudentProfileEditor() {
  const navigate = useNavigate(); // Initialize navigate
  const { user, updateUser, addProjectToPortfolio, updateProjectInPortfolio, loading } = useUser();
  const [localState, setLocalState] = useState({
    username: '',
    email: '',
    university: '',
    user_tyoe: '',
    interests: [],
    skills: [],
    biography: '',
    profile_photo: '',
    personal_website: '',
    papers: [],
    orgs: [],
    portfolio: [],
  });
  const [tab, setTab] = useState('info'); // Control tab state
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ projectName: '', projectDescription: '', projectLink: '', githubLink: '', media: '', markdown: '', tags: [] });
  const [showFields, setShowFields] = useState({
    projectName: false,
    projectDescription: false,
    githubLink: false,
    media: false,
    markdown: false,
    projectLink: false,
    tags: false,
  });

  // This updates the local state with the user context whenever the user context changes.
  useEffect(() => {
    if (user) {
      setLocalState({
        username: user.username || '',
        email: user.email || '',
        university: user.university || '',
        user_tyoe: user.user_tyoe || '',
        interests: user.interests || [],
        skills: user.skills || [],
        biography: user.biography || '',
        profile_photo: user.profile_photo || '',
        personal_website: user.personal_website || '',
        papers: user.papers || [],
        orgs: user.orgs || [],
        portfolio: user.portfolio || [],
      });
    }
  }, [user]);

  const handleInputChange = (e, field) => {
    if (tab === 'info') {
      if (field === 'interests' || field === 'skills') {
        setLocalState({ ...localState, [field]: e.target.value.split(',').map(item => item.trim()) });
      } else {
        setLocalState({ ...localState, [field]: e.target.value });
      }
    } else if (selectedProject) {
      if (field === 'tags') {
        setSelectedProject({ ...selectedProject, [field]: e.target.value.split(',').map(tag => tag.trim()) });
      } else {
        setSelectedProject({ ...selectedProject, [field]: e.target.value });
      }
    } else {
      if (field === 'tags') {
        setNewProject({ ...newProject, [field]: e.target.value.split(',').map(tag => tag.trim()) });
      } else {
        setNewProject({ ...newProject, [field]: e.target.value });
      }
    }
  };

  const toggleField = (field) => {
    setShowFields({ ...showFields, [field]: !showFields[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit the user information updates to the backend
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/studentProfileEditor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(localState)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setError('Profile updated successfully');
        updateUser(localState);
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
        <div className={styles.tabContainer}>
          <button onClick={() => setTab('info')} className={`${styles.button} ${tab === 'info' ? styles.activeTab : ''}`}>Edit Information</button>
          <button onClick={() => setTab('portfolio')} className={`${styles.button} ${tab === 'portfolio' ? styles.activeTab : ''}`}>Edit Portfolio</button>
        </div>

        {tab === 'info' && (
          <EditInfoTab 
            localState={localState} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
          />
        )}

        {tab === 'portfolio' && (
          <EditPortfolioTab 
            user={user}
            showFields={showFields}
            toggleField={toggleField}
            handleInputChange={handleInputChange}
            newProject={newProject}
            setNewProject={setNewProject}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            setError={setError}
            addProjectToPortfolio={addProjectToPortfolio}
            updateProjectInPortfolio={updateProjectInPortfolio}
          />
        )}
      </div>
      {tab === 'portfolio' ? (
        user && user.portfolio && (
          <div className={styles.stateViewer}>
            <PortfolioDisplay user={user} />
          </div>
        )
      ) : (
        <div className={styles.currentInfo}>
          <h3>Current Info:</h3>
          <p>Username: {user ? user.username : 'N/A'}</p>
          <p>Email: {user ? user.email : 'N/A'}</p>
          <p>University: {user ? user.university : 'N/A'}</p>
          <p>Interests: {user ? user.interests.join(', ') : 'N/A'}</p>
          <p>Skills: {user ? user.skills.join(', ') : 'N/A'}</p>
          <p>Biography: {user ? user.biography : 'N/A'}</p>
          <p>Profile Photo: {user ? user.profile_photo : 'N/A'}</p>
          <p>Personal Website: {user ? user.personal_website : 'N/A'}</p>
        </div>
      )}
    </div>
  );
}

export default StudentProfileEditor;








