


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import styles from './profileHeader.module.css';
import { useUser } from '../contexts/UserContext';
import { FaGithub, FaGlobe, FaLink } from 'react-icons/fa';

const ProfileHeader = ({ userData, loading, error }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const toggleBio = () => {
    setShowFullBio(!showFullBio);
  };

  const toggleResume = () => {
    setShowResume(!showResume);
  };

  const getLinkLabel = (url) => {
    try {
      // Remove protocol if present
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      
      // Split the remaining string by dots
      const parts = cleanUrl.split('.');
      
      // Return the first part (main domain name)
      return parts[0];
    } catch (error) {
      console.error('Error parsing URL:', error);
      return 'Link';
    }
  };
  
  const getTruncatedBio = (bio, length) => {
    if (bio.length <= length) {
      return bio;
    }
    return bio.substring(0, length) + '...';
  };

  const ensureProtocol = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'http://' + url;
    }
    return url;
  };

  const renderLinkButton = (link, icon) => {
    const label = getLinkLabel(link);
    return (
      <a
        href={ensureProtocol(link)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkButton}
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  };

  if (loading) return <p className={styles.loadingError}>Loading...</p>;
  if (error) return <p className={styles.loadingError}>Error: {error}</p>;
  if (!userData) return <p className={styles.loadingError}>No user data available</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.leftColumn}>
          <ProfileImage username={userData.username} size={'large'} />
          <div className={styles.typeAndName}>
            <h3 className={styles.userTypeTag}>{userData.user_type}</h3>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.nameAndTagsBox}>
            <h1 className={styles.userName}>{userData.username}</h1>
            <div className={styles.tagsContainer}>
              <div className={styles.tagSection}>
                <h4 className={styles.tagLabel}>Skills</h4>
                <div className={styles.tagList}>
                  {userData.skills && userData.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
              <div className={styles.tagSection}>
                <h4 className={styles.tagLabel}>Interests</h4>
                <div className={styles.tagList}>
                  {userData.interests && userData.interests.map((interest, index) => (
                    <span key={index} className={styles.interestTag}>{interest}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.bioContainer}>
            <p>{showFullBio ? userData.biography : getTruncatedBio(userData.biography, 300)}</p>
            <button onClick={toggleBio} className={styles.bioButton}>
              {showFullBio ? 'Less bio' : 'More bio'}
            </button>
          </div>
          <div className={styles.linksContainer}>
            <button onClick={toggleResume} className={styles.linkButton}>View Resume</button>
            {userData.github_link && renderLinkButton(userData.github_link, <FaGithub />, 'GitHub')}
            {userData.personal_website && renderLinkButton(userData.personal_website, <FaGlobe />, 'Personal Website')}
            {userData.links && userData.links.map((link, index) => (
              renderLinkButton(link, <FaLink key={index} />)
            ))}
          </div>
        </div>
      </div>
      {showResume && (
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={toggleResume}>X</button>
          <embed
            src={userData.resume}
            type="application/pdf"
            width="80%"
            height="80%" 
          />
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;




