import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './SignUp.module.css';
import GoLiveLanding from '../GoLivePage/GoLiveLandingPage';
import config from '../../config';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [selectedTab, setSelectedTab] = useState('Student');
  const [profile_photo, setProfilePhoto] = useState('');
  const [personal_website, setPersonalWebsite] = useState('');
  const [error, setError] = useState('');

  const { updateUser } = useUser();
  const { login } = useUser();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleUniversityChange = (e) => setUniversity(e.target.value);
  const handleProfilePhotoChange = (e) => setProfilePhoto(e.target.value);
  const handlePersonalWebsiteChange = (e) => setPersonalWebsite(e.target.value);
  const handleBackButtonClick = () => navigate('/login');
  const handleTabChange = (tab) => setSelectedTab(tab);

  const [keyFlag, setKeyFlag] = useState(false);

  const user_type = selectedTab;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username,
      password,
      email,
      university,
      user_type,
      profile_photo,
      personal_website,
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
        try {
          localStorage.setItem('token', data.access_token);
          updateUser(data.new_user);
          navigate(`/${selectedTab.toLowerCase()}Profile`);
        } catch (error) {
          setError(error.message || 'login failed');
        }
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
              <input type="text" value={username} onChange={handleUsernameChange} placeholder="Enter your username" />
            </div>
            <div className={styles.inputContainer}>
              <label>Email:</label>
              <input type="text" value={email} onChange={handleEmailChange} placeholder="Enter your email" />
            </div>
            <div className={styles.inputContainer}>
              <label>Password:</label>
              <input type="password" value={password} onChange={handlePasswordChange} placeholder="Enter your password" />
            </div>
            <div className={styles.inputContainer}>
              <label>University:</label>
              <input type="text" value={university} onChange={handleUniversityChange} placeholder="Enter your university" />
            </div>
            <div className={styles.inputContainer}>
              <label>Profile Photo URL:</label>
              <input type="text" value={profile_photo} onChange={handleProfilePhotoChange} placeholder="Enter profile photo URL" />
            </div>
            <div className={styles.inputContainer}>
              <label>Personal Website:</label>
              <input type="text" value={personal_website} onChange={handlePersonalWebsiteChange} placeholder="Enter personal website" />
            </div>
            <button className={styles.bottomButton} type="submit">Sign Up</button>
            <button className={styles.bottomButton} onClick={handleBackButtonClick}>Back</button>
          </form>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export default SignUp;
