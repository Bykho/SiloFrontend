


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfile.module.css'; // Import the CSS module
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import AddBlocPortfolio from '../../components/AddBlocPortfolio';
import InfoEditor from '../OLDStudentProfileEditorPage/StudentProfileEditor';
import config from '../../config';

function StudentProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'POST',
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
        setLoading(false);
      }
    };
    fetchUserData();

    // Check if the user just signed up
    if (location.state && location.state.justSignedUp) {
      setShowEditor(true);
    }
  }, [location.state]);

  if (!user || !userData) {
    return <p> Loading ... </p>;
  }

  const handleEditProfileClick = () => {
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  const handleAddProjectClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
        <button className={styles.bigButton} onClick={handleAddProjectClick}>Add New Project</button>
      </div>
      <div className={styles.contentContainer}>
        {loading ? (
          <p> Loading ... </p>
        ) : error ? (
          <p> Error: {error}</p>
        ) : userData && (
          <PortfolioDisplay user={userData}/>
        )}
      </div>
      {showEditor && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseEditor}>X</button>
            <InfoEditor initLocalData={userData} />
          </div>
        </div>
      )}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}>X</button>
            <AddBlocPortfolio />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;




