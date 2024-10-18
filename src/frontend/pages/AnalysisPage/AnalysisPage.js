import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AnalysisPage.module.css';
import config from '../../config';
import { CircularProgress } from '@mui/material';
import CleanOrbitingRingLoader from '../../components/FractalLoadingBar';
import { IoSparkles } from 'react-icons/io5';
import PlayerRatingSpiderweb from '../../components/UserSpiderPlot';

const AnalysisPage = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
        setLoading(false);
      }
  };
    
  useEffect(() => {
      fetchUserData();
  }, []);

  if (loading) {
      return <CleanOrbitingRingLoader />;
  }

  if (error) {
      return <p>{error}</p>;
  }

  if (!userData) {
      return <p>No user data available</p>;
  }

  const userSpiderData = userData.scores[userData.scores.length - 1];

  return (
      <div className={styles.container}>
          <PlayerRatingSpiderweb playerData={userSpiderData} userData={userData} />
      </div>
  );
};

export default AnalysisPage;