import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../../components/ProfileImage';
import styles from './publicProfileHeader.module.css';
import { FaGithub, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const PublicProfileHeader = ({ userData, loading, error }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

  const toggleBio = () => setShowFullBio(!showFullBio);

  const renderTags = (tags, type) => (
    <div className={styles.tagSection}>
      <h3 className={styles.tagLabel}>{type}</h3>
      <div className={styles.tagList}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag} onClick={() => handleTagClick(tag, type)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  const handleTagClick = (tag, type) => {
    if (type === 'Skills') {
      navigate('/GenDirectory', { state: { skill: tag } });
    }
  };

  if (loading) return <div className={styles.loadingError}>Loading...</div>;
  if (error) return <div className={styles.loadingError}>Error: {error}</div>;
  if (!userData) return <div className={styles.loadingError}>No user data available</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.topSection}>
        <ProfileImage username={userData.username} size={'large'} />
        <div className={styles.infoContainer}>
          <h1 className={styles.userName}>{userData.username}</h1>
          <p className={styles.userInfo}>{userData.user_type} @ {userData.university} | {userData.major} | Class of {userData.grad}</p>
        </div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.bioSection}>
        <p className={styles.bio} onClick={toggleBio}>
          {showFullBio ? userData.biography : `${userData.biography.substring(0, 350)}...`}
        </p>
        <button onClick={toggleBio} className={styles.bioToggle}>
          {showFullBio ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.tagsContainer}>
        {renderTags(userData.skills, 'Skills')}
        {renderTags(userData.interests, 'Interests')}
      </div>
      <div className={styles.divider}></div>
      <div className={styles.buttonContainer}>
        <button className={styles.resumeButton}>View Resume</button>
        <a href={userData.github_link} target="_blank" rel="noopener noreferrer" className={styles.githubButton}>
          <FaGithub /> GitHub
        </a>
      </div>
    </div>
  );
};

export default PublicProfileHeader;