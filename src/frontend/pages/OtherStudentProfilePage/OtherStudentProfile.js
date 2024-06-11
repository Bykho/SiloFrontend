



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './otherStudentProfile.module.css'; // Import the CSS module
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';

import config from '../../config';

function OtherStudentProfile() {
  const { username } = useParams(); // Get the username from the URL parameters
  const navigate = useNavigate(); // Initialize navigate
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/profile/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('this is the useeffect userdata response: ', response)
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
  }, [username]);

  if (!user || !userData) {
    return <p> Loading ... </p>;
  }

  return (
    <div>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
      />
      <div>
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

export default OtherStudentProfile;




