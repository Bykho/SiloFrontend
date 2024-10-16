import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './workHistoryDisplay.module.css';
import JobEntry from './JobEntry';
import config from '../../config';

const WorkHistoryDisplay = ({ user: passedUser }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [workHistory, setWorkHistory] = useState({});
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchWorkHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/getUserWorkHistory`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: passedUser?._id || user._id })
        });
        const data = await response.json();
        if (response.ok) {
          setWorkHistory(data);
        } else {
          setError(`Failed to fetch Work History: ${data.message}`);
        }
      } catch (error) {
        setError(`Error fetching Work History: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkHistory();
    setIsMyProfile(passedUser?._id === user._id);
  }, [passedUser, user._id]);

  const handleUpdateExperience = (updatedExperience, originalCompany) => {
    setWorkHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      // Remove the old entry if the company name has changed
      if (originalCompany && originalCompany !== updatedExperience.company) {
        delete newHistory[originalCompany];
      }
      // Add or update the new entry
      newHistory[updatedExperience.company] = updatedExperience;
      return newHistory;
    });
    setHasChanges(true);
  };

  const handleSaveWorkHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/updateWorkExperience`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: passedUser?._id || user._id,
          workHistory: workHistory
        })
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setWorkHistory(data);
        setHasChanges(false);
        console.log("Work history updated successfully in the database");
      } else {
        const errorData = await response.json();
        setError(`Failed to update work history in the database: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating work history in the database:', error);
      setError(`Error updating work history in the database: ${error.message}`);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!workHistory || Object.keys(workHistory).length === 0) {
    return <div className={styles.noHistory}>User needs to add their resume to retrieve work history</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        {Object.entries(workHistory).map(([company, details]) => (
          <JobEntry 
            key={company} 
            experience={details}
            isMine={isMyProfile} 
            onUpdate={(updatedExperience) => handleUpdateExperience(updatedExperience, company)}
          />
        ))}
      </div>
      {isMyProfile && hasChanges && (
        <button className={styles.saveButton} onClick={handleSaveWorkHistory}>
          Save All Changes to Database
        </button>
      )}
    </div>
  );
};

export default WorkHistoryDisplay;