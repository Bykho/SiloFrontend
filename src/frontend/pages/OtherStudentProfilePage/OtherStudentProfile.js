import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import WorkHistoryDisplay from '../../components/WorkHistory/WorkHistoryDisplay';
import styles from './otherStudentProfile.module.css';
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import config from '../../config';
import { ChevronDown, ChevronUp } from 'lucide-react';

function OtherStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [showWorkHistory, setShowWorkHistory] = useState(true);

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
  }, [id]);

  if (!user || !userData) {
    return <p>Loading...</p>;
  }

  const togglePortfolio = () => {
    setShowPortfolio(!showPortfolio);
  };

  const toggleWorkHistory = () => {
    setShowWorkHistory(!showWorkHistory);
  };

  return (
    <div className={styles.otherStudentProfileContainer}>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
        isOwnProfile={false}
      />
      <div className={styles.contentContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : userData && (
          <>
            <PortfolioDisplay user={userData} />
            <WorkHistoryDisplay user={userData} />
          </>
        )}
      </div>
    </div>
  );
}

export default OtherStudentProfile;

