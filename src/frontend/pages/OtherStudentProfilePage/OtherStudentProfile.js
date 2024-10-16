


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import WorkHistoryDisplay from '../../components/WorkHistory/WorkHistoryDisplay';
import styles from './otherStudentProfile.module.css';
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import config from '../../config';
import { Briefcase, Eye } from 'react-feather';

function OtherStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const [viewMode, setViewMode] = useState("Portfolio");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/profile/${id}`, {
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
        console.log('here is data:', data)
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

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "Portfolio" ? "Work" : "Portfolio");
  };

  return (
    <div className={styles.otherStudentProfileContainer}>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
      />
      <div className={styles.buttonContainer}>
        <button className={styles.bigButton} onClick={toggleViewMode}>
          {viewMode === "Portfolio" ? <><Briefcase /> Work History</> : <><Eye /> See Portfolio</>}
        </button>
      </div>
      <div>
        {loading ? (
          <p> Loading ... </p>
        ) : error ? (
          <p> Error: {error}</p>
        ) : userData && (
          viewMode === "Portfolio" ? (
            <PortfolioDisplay user={userData} />
          ) : (
            <WorkHistoryDisplay user={userData} />
          )
        )}
      </div>
    </div>
  );
}

export default OtherStudentProfile;



