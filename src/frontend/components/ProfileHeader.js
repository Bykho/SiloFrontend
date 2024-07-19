import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import styles from './profileHeader.module.css';
import { FaGithub, FaGlobe, FaLink } from 'react-icons/fa';

const ProfileHeader = ({ userData, loading, error }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioTruncated, setBioTruncated] = useState(false);
  const skillsSectionRef = useRef(null);
  const interestsSectionRef = useRef(null);

  const BIO_LENGTH_LIMIT = 300;
  const VISIBLE_TAGS = 2;

  useEffect(() => {
    if (userData && userData.biography) {
      setBioTruncated(userData.biography.length > BIO_LENGTH_LIMIT);
    }
  }, [userData]);

  const toggleBio = () => setShowFullBio(!showFullBio);

  const renderTagsPreview = (tags, type) => {
    const previewTags = tags.slice(0, VISIBLE_TAGS);
    const remainingTags = tags.slice(VISIBLE_TAGS);
    return (
      <div className={styles.tagSection} ref={type === 'skill' ? skillsSectionRef : interestsSectionRef}>
        <span className={styles.tagLabel}>{type === 'skill' ? 'Skills:' : 'Interests:'}</span>
        {previewTags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
        {remainingTags.length > 0 && (
          <div className={styles.moreTagsContainer}>
            <span className={styles.moreButton}>+{remainingTags.length} more</span>
            <div className={styles.hoverModal}>
              {remainingTags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTruncatedBio = (bio) => {
    if (bio.length <= BIO_LENGTH_LIMIT) {
      return bio;
    }
    return bio.substring(0, BIO_LENGTH_LIMIT) + '...';
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

  const renderLinkButton = (link, icon) => {
    const label = getLinkLabel(link);
    return (
      <a
        href={link}
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
        <div className={styles.topSection}>
          <ProfileImage username={userData.username} size={'medium'} />
          <div className={styles.nameSection}>
            <h1 className={styles.userName}>{userData.username}</h1>
            <p className={styles.userInfo}>{userData.user_type} @ {userData.university} | {userData.major} {userData.grad}</p>
          </div>
          <div className={styles.tagsContainer}>
          {renderTagsPreview(userData.skills, 'skill')}
          {renderTagsPreview(userData.interests, 'interest')}
        </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.bioContainer}>
          <p className={styles.bio}>{showFullBio ? userData.biography : getTruncatedBio(userData.biography)}</p>
          {bioTruncated && (
            <button onClick={toggleBio} className={styles.bioButton}>
              {showFullBio ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        <div className={styles.linksContainer}>
          <button className={styles.linkButton}>View Resume</button>
          {userData.github_link && renderLinkButton(userData.github_link, <FaGithub />)}
          {userData.personal_website && renderLinkButton(userData.personal_website, <FaGlobe />)}
          {userData.links && userData.links.map((link, index) => (
            renderLinkButton(link, <FaLink key={index} />)
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;