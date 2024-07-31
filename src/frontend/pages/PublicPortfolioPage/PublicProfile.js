
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../config';
import ProfileHeader from '../../components/ProfileHeader'; // Import the ProfileHeader component
import styles from './publicProfile.module.css'; // Import the CSS module

const PublicProfile = () => {
  const { username, user_id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/public/${username}/${user_id}`);
        if (!response.ok) {
          const errorMessage = response.status === 404 ? 'Profile not found or not shared' : 'Failed to fetch profile data';
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data: ', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user_id]);

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      {profileData ? (
        <div>
          <ProfileHeader userData={profileData} loading={loading} error={error} /> {/* Use ProfileHeader */}
          <div className={styles.profileDetails}>
            {/* Add other details here */}
          </div>
          <div className={styles.portfolio}>
            <h2>Portfolio</h2>
            {profileData.portfolio.map((item, index) => (
              <div key={index} className={styles.portfolioItem}>
                <p>{JSON.stringify(item)}</p>
              </div>
            ))}
          </div>
          {/* Add other fields you want to display */}
        </div>
      ) : (
        <p className={styles.profileNotFound}>Profile not found or not shared.</p>
      )}
    </div>
  );
};

export default PublicProfile;



