import React, { useState, useEffect } from 'react';
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
  const [bioTruncated, setBioTruncated] = useState(false);

  const BIO_LENGTH_LIMIT = 300;

  useEffect(() => {
    if (userData && userData.biography) {
      setBioTruncated(userData.biography.length > BIO_LENGTH_LIMIT);
    }
    console.log("here is usedata: ", userData)
  }, [userData]);

  const toggleBio = () => {
    setShowFullBio(!showFullBio);
  };

  const toggleResume = () => {
    setShowResume(!showResume);
  };

  const getLinkLabel = (url) => {
    try {
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      const parts = cleanUrl.split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch (error) {
      console.error('Error parsing URL:', error);
      return 'Link';
    }
  };

  const getTruncatedBio = (bio) => {
    if (bio.length <= BIO_LENGTH_LIMIT) {
      return bio;
    }
    return bio.substring(0, BIO_LENGTH_LIMIT) + '...';
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

  const handleSkillClick = (skill) => {
    navigate('/GenDirectory', { state: { skill } });
  };

  if (loading) return <p className={styles.loadingError}>Loading...</p>;
  if (error) return <p className={styles.loadingError}>Error: {error}</p>;
  if (!userData) return <p className={styles.loadingError}>No user data available</p>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.topSection}>
          <ProfileImage username={userData.username} size={'medium'} />
          <div className={styles.nameAndInfo}>
            <h1 className={styles.userName}>{userData.username}</h1>
            <div className={styles.userInfo}>
              <span>{userData.user_type}</span>
              <span>@</span>
              <span>{userData.university}</span>
              <span>|</span>
              <span>{userData.major}</span>
              <span>{userData.grad}</span>
            </div>
          </div>
        </div>
        <div className={styles.tagsContainer}>
          <div className={styles.tagSection}>
            <h4 className={styles.tagLabel}>Skills</h4>
            <div className={styles.tagListWrapper}>
              <div className={styles.tagList}>
                {userData.skills && userData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={styles.skillTag}
                    onClick={() => handleSkillClick(skill)}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.tagSection}>
            <h4 className={styles.tagLabel}>Interests</h4>
            <div className={styles.tagListWrapper}>
              <div className={styles.tagList}>
                {userData.interests && userData.interests.map((interest, index) => (
                  <span key={index} className={styles.interestTag}>{interest}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bioContainer}>
          <p>{showFullBio ? userData.biography : getTruncatedBio(userData.biography)}</p>
          {bioTruncated && (
            <button onClick={toggleBio} className={styles.bioButton}>
              {showFullBio ? 'Less bio' : 'More bio'}
            </button>
          )}
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