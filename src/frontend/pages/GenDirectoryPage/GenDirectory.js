



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './genDirectory.module.css';
import { useUser } from '../../contexts/UserContext';
import ProfileImage from '../../components/ProfileImage';
import Orged from '../../components/OrgFeed';
import Interesed from '../../components/InterestFeed'
import config from '../../config';

function Directory() {
  const navigate = useNavigate();
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [FeedStyle, setFeedStyle] = useState('showOrged');
  const { user } = useUser();


  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('gendirectory use effect is open')
        const response = await fetch(`${config.apiBaseUrl}/genDirectory`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('Response from the backend:', response);

        if (!response.ok) {
          throw new Error('Failed to fetch directory data');
        }

        const data = await response.json();
        console.log('Data from the backend:', data);
        setDirectory(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching directory data:', error);
        setLoading(false);
      }
    };

    fetchDirectory();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.navBar}>
        <p>Filter by: </p>
        <p
          className={`${styles.navLink} ${FeedStyle === 'showOrged' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showOrged')}
        >
        Organizations
        </p>
        <p
          className={`${styles.navLink} ${FeedStyle === 'showRanked' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showInterests')}
        >
          Interests
        </p>
      </div>
      <div className = {styles.doubles}>
        <div>
          {FeedStyle === 'showOrged' && <Orged />}
          {FeedStyle === 'showInterests' && <Interesed />}
        </div>
        <div className={styles.rightColumn}>
            <h2 className={styles.stickyHeader}>Directory Channel</h2>
            {directory.map((user, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.userInfo}>
                  <div className={styles.userDetails}>
                    <ProfileImage username={user.username} size="medium" />
                    <h3 className={styles.username}>{user.username}</h3>
                    <div className={styles.infoLine}>
                      <div className={styles.interests}>
                        <span className={styles.label}>Interests:</span>
                        <span className={styles.info}>{user.interests ? user.interests.join(', ') : 'No interests listed'}</span>
                      </div>
                      <div className={styles.orgs}>
                        <span className={styles.label}>Organizations:</span>
                        <span className={styles.info}>{user.orgs ? user.orgs.join(', ') : 'No orgs listed'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.buttonContainer}>
                  <button className={styles.DMbutton}>Direct Message</button>
                  <button
                    className={styles.button}
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}

          {/*}
          <h2 className={styles.stickyHeader}>Communication Channel</h2>
          <ul>
            <li className={styles.directoryEntry}>User Name</li>
            <li className={styles.directoryEntry}>Recruiter @ ...</li>
          </ul>
        </div>
        */}
      </div>
    </div>
  </div>
  );  
}

export default Directory;


