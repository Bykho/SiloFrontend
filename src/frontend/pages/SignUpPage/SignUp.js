


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Ensure this path matches your project structure
import styles from './SignUp.module.css';
import GoLiveLanding from '../GoLivePage/GoLiveLandingPage';

import config from '../../config';


function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [selectedTab, setSelectedTab] = useState('Student');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [biography, setBiography] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [personalWebsite, setPersonalWebsite] = useState('');
  const { updateUser } = useUser();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleUniversityChange = (e) => setUniversity(e.target.value);
  const handleInterestsChange = (e) => setInterests(e.target.value.split(','));
  const handleSkillsChange = (e) => setSkills(e.target.value.split(','));
  const handleBiographyChange = (e) => setBiography(e.target.value);
  const handleProfilePhotoChange = (e) => setProfilePhoto(e.target.value);
  const handlePersonalWebsiteChange = (e) => setPersonalWebsite(e.target.value);
  const handleBackButtonClick = () => navigate('/login');
  const handleTabChange = (tab) => setSelectedTab(tab);

  const [keyFlag, setKeyFlag] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username,
      email,
      password,
      university,
      user_type: selectedTab.toLowerCase(),
      portfolio: [],
      interests,
      skills,
      biography,
      profile_photo: profilePhoto,
      personal_website: personalWebsite,
      papers: [],
      upvoted_projects: [],
      messages: []
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/SignUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data);
        navigate(`/${selectedTab.toLowerCase()}Profile`);
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.tabTitle}>{selectedTab} Sign Up</h2>
      {!keyFlag ? (
        <GoLiveLanding setKeyFlag={setKeyFlag} />
      ) : (
        <>
      <div className={styles.tabContainer}>
        <button onClick={() => handleTabChange('Student')} className={`${styles.button} ${selectedTab === 'Student' ? styles.activeTab : ''}`}>Student</button>
        <button onClick={() => handleTabChange('Faculty')} className={`${styles.button} ${selectedTab === 'Faculty' ? styles.activeTab : ''}`}>Faculty</button>
      </div>

      <div className={styles.formInfoContainer}>
        <div className={styles.signInForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <label>Username:</label>
              <input type="text" value={username} onChange={handleUsernameChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>Email:</label>
              <input type="text" value={email} onChange={handleEmailChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>Password:</label>
              <input type="password" value={password} onChange={handlePasswordChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>University:</label>
              <input type="text" value={university} onChange={handleUniversityChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>Interests:</label>
              <input type="text" value={interests} onChange={handleInterestsChange} placeholder="Comma-separated" />
            </div>
            <div className={styles.inputContainer}>
              <label>Skills:</label>
              <input type="text" value={skills} onChange={handleSkillsChange} placeholder="Comma-separated" />
            </div>
            <div className={styles.inputContainer}>
              <label>Biography:</label>
              <input type="text" value={biography} onChange={handleBiographyChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>Profile Photo URL:</label>
              <input type="text" value={profilePhoto} onChange={handleProfilePhotoChange} />
            </div>
            <div className={styles.inputContainer}>
              <label>Personal Website:</label>
              <input type="text" value={personalWebsite} onChange={handlePersonalWebsiteChange} />
            </div>
            <button className={styles.bottomButton} type="submit">Sign Up</button>
            <button className={styles.bottomButton} onClick={handleBackButtonClick}>Back</button>
          </form>
        </div>
        <div className={styles.viewInfo}>
          {selectedTab === 'Student' ? 'Below would be info about the student view' : 'Below would be info about the faculty view'}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export default SignUp;




