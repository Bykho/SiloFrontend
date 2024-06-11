



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfile.module.css'; // Import the CSS module
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';

import config from '../../config';

function StudentProfile() {
  const navigate = useNavigate(); // Initialize navigate
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (!user || !userData) {
    return <p> Loading ... </p>;
  }

  const handleEditProfileClick = () => {
    navigate('/studentProfileEditor');
  };

  return (
    <div>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
      />
      <div className={styles.buttonContainer}>
        <button className={styles.bigButton} onClick={handleEditProfileClick}>Edit My Profile</button>
        <button className={styles.bigButton}>Share My Profile</button>
        <button className={styles.bigButton}>Add New Project</button>
      </div>
      <div className={styles.contentContainer}>
        {loading ? (
          <p> Loading ... </p>
        ) : error ? (
          <p> Error: {error}</p>
        ) : userData && (
          <PortfolioDisplay user={userData} />
        )}
      </div>
    </div>
  );
}

export default StudentProfile;


