


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import styles from './profileHeader.module.css'; // Import the CSS module
import { useUser } from '../contexts/UserContext';

const ProfileHeader = ({ userData, loading, error }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false); // State to control the biography display

  const toggleBio = () => {
    setShowFullBio(!showFullBio);
  };

  const getTruncatedBio = (bio, length) => {
    if (bio.length <= length) {
      return bio;
    }
    return bio.substring(0, length) + '...';
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.leftColumn}>
          {loading ? (
            <p> Loading ... </p>
          ) : error ? (
            <p> Error: {error}</p>
          ) : userData && (
            <ProfileImage username={userData.username} size={'large'} />
          )}
          <div className={styles.typeAndName}>
            <h3 className={styles.userTypeTag}>
              {userData ? userData.user_type : 'n/a'}
            </h3>
          </div>
        </div>
        <div className={styles.firstColBox}>
          <div className={styles.topRowBox}>
            <div className={styles.nameAndTagsBox}>
              <h1 className={styles.userName}>
                {userData ? userData.username : 'Loading...'}
              </h1>
              <div className={styles.interestsAndSkillsBox}>
                <h4 className={styles.labelSkills}>Skills</h4>
                {userData && userData.skills && userData.skills.length > 0 && (
                  <div className={styles.skillListBox}>
                    {userData.skills.map((skill, index) => (
                      <div key={index} className={styles.skillTagStyle}>
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
                <h4 className={styles.labelInterests}>Interests</h4>
                {userData && userData.interests && userData.interests.length > 0 && (
                  <div className={styles.interestListBox}>
                    {userData.interests.map((interest, index) => (
                      <div key={index} className={styles.interestsTagStyle}>
                        {interest}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.bioAndSkillsBox}>
            <div className={styles.bioContainer}>
              <p>{showFullBio ? userData.biography : getTruncatedBio(userData.biography, 300)}</p>
              <button onClick={toggleBio} className={styles.bioButton}>
                {showFullBio ? 'Less bio' : 'More bio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  

};

export default ProfileHeader;






