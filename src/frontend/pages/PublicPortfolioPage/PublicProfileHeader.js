import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../../components/ProfileImage';
import styles from './publicProfileHeader.module.css';
import { FaGithub, FaChevronDown, FaChevronUp, FaWindowClose } from 'react-icons/fa';

const PublicProfileHeader = ({ userData, loading, error }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const toggleResume = () => {
    setShowResume(!showResume);
  };
  
  const isValidResume = (resumeData) => {
    if (!resumeData || typeof resumeData !== 'string') return false;
    return resumeData.startsWith('data:application/pdf;base64,');
  };
  
  const getLinkLabel = (url) => {
    try {
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      const parts = cleanUrl.split(/[\/\.]/);
      const labelPart = parts[0];
      return labelPart.charAt(0).toUpperCase() + labelPart.slice(1);
    } catch (error) {
      console.error('Error parsing URL:', error);
      return 'Link';
    }
  };
  
  const renderLinkButton = (link, icon) => {
    let fullLink = link;
    let label = getLinkLabel(link);
  
    // Check if it's a GitHub link
    if (icon.type === FaGithub) {
      // If it's just a username, construct the full GitHub URL
      if (!link.includes('github.com') && !link.includes('http')) {
        fullLink = `https://github.com/${link}`;
        label = link; // Use the username as the label
      }
    }
  
    return (
      <a
        href={fullLink}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.githubButton}
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  };
  
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
        <div className={styles.buttonContainer}>
          <button className={styles.resumeButton} onClick={toggleResume}>View Resume</button>
          {userData.github_link && renderLinkButton(userData.github_link, <FaGithub />)}
        </div>
      </div>
      
      {/* Resume Modal */}
      {showResume && (
        <div className={styles.resumeModal}>
          <button className={styles.closeButton} onClick={toggleResume}><FaWindowClose /></button>
          {isValidResume(userData.resume) ? (
            <embed src={userData.resume} type="application/pdf" width="80%" height="80%" />
          ) : (
            <div className={styles.resumePlaceholder}>
              User needs to reupload resume
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicProfileHeader;