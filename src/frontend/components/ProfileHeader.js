import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import styles from './profileHeader.module.css';
import { FaGithub, FaGlobe, FaLink, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoMdMail } from "react-icons/io";
import PlayerRatingSpiderweb from './UserSpiderPlot';
import { FaWindowClose } from 'react-icons/fa';
import { TbAnalyze } from "react-icons/tb";


const ProfileHeader = ({ userData, loading, error }) => {
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);
  const [bioTruncated, setBioTruncated] = useState(false);
  const skillsSectionRef = useRef(null);
  const interestsSectionRef = useRef(null);
  const [showResume, setShowResume] = useState(false);
  const [showCopiedConfirmation, setShowCopiedConfirmation] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const location = useLocation();
  const isProfilePage = location.pathname.includes('/profile/');

  const BIO_LENGTH_LIMIT = 300;
  const VISIBLE_TAGS = 2;

  //Build out below.
  const userSpiderData = userData.scores[userData.scores.length - 1]

  const isValidResume = (resumeData) => {
    if (!resumeData || typeof resumeData !== 'string') return false;
    return resumeData.startsWith('data:application/pdf;base64,');
  };

  useEffect(() => {
    if (userData && userData.biography) {
      setBioTruncated(userData.biography.length > BIO_LENGTH_LIMIT);
    }
  }, [userData]);

  const toggleResume = () => {
    console.log('here is the resume: ', userData.resume)
    setShowResume(!showResume);
  }

  const toggleRating = () => {
    setShowRating(!showRating);
  }


  const renderRatingModal = () => (
    <div className={styles.modalContent}>
      <button className={styles.closeButton2} onClick={toggleRating}><FaWindowClose /> </button>
      <PlayerRatingSpiderweb playerData={userSpiderData} userData={userData} />
    </div>
  );

  const toggleBio = () => setShowFullBio(!showFullBio);

  const renderTagsPreview = (tags, type) => {
    const previewTags = tags.slice(0, VISIBLE_TAGS);
    const remainingTags = tags.slice(VISIBLE_TAGS);
    return (
      <div className={styles.tagSection} ref={type === 'skill' ? skillsSectionRef : interestsSectionRef}>
        <span className={styles.tagLabel}>{type === 'skill' ? 'Skills:' : 'Interests:'}</span>
        {previewTags.map((tag, index) => (
          <span key={index} className={styles.tag} onClick={() => handleSkillClick(tag)}>
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

  const handleContactButton = () => {
    const email = userData.email;
    navigator.clipboard.writeText(email).then(() => {
      setShowCopiedConfirmation(true);
      setTimeout(() => {
        setShowCopiedConfirmation(false);
      }, 2000); // Hide the confirmation after 2 seconds
    }).catch((err) => {
      console.error('Failed to copy URL: ', err);
    });
    console.log('Contact button clicked'); 
  }; 

  const renderLinkButton = (link, icon) => {
    let fullLink = ensureProtocol(link);
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
        className={styles.linkButton}
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  };

  const handleSkillClick = (skill) => {
    navigate('/GenDirectory', { state: { skill: skill } });
  }

  const ensureProtocol = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
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
            <p className={styles.userInfo}>{userData.user_type} | {userData.university} | {userData.major} {userData.grad}</p>
          </div>
          {/*
          {!isProfilePage && (
            <button className={styles.analyzeButton} onClick={toggleRating}> <TbAnalyze />Analyze Me</button>
          )}
          */}
        </div>
        <div className={styles.tagsContainer}>

          <div className={styles.linksContainer}>
            <button className={styles.contactMeButton} onClick={handleContactButton}> <IoMdMail /> Contact </button>
            <button className={styles.linkButton} onClick={toggleResume}>View Resume</button>
            {userData.github_link && renderLinkButton(userData.github_link, <FaGithub />)}
            {userData.personal_website && renderLinkButton(userData.personal_website, <FaGlobe />)}
            {userData.links && userData.links.map((link, index) => (
              renderLinkButton(link, <FaLink key={index} />)
            ))}
            {showCopiedConfirmation && (
            <div className={styles.copyConfirmation}>Email copied to clipboard!</div>
          )}
          </div>
          {renderTagsPreview(userData.skills, 'skill')}
          {renderTagsPreview(userData.interests, 'interest')}

        </div>

        <div className={styles.divider}> </div>
        <div className={styles.bioContainer}>
          <p className={styles.bio} onClick={toggleBio}>{showFullBio ? userData.biography : getTruncatedBio(userData.biography)}</p>
          {bioTruncated && (
            <button onClick={toggleBio} className={styles.bioButton}>
              {showFullBio ? <FaChevronUp /> : <FaChevronDown/>}
            </button>
          )}
        </div>
      </div>
      {showResume && (
        <div className={styles.resumeModal}>
          <button className={styles.closeButton2} onClick={toggleResume}><FaWindowClose /> </button>
          {isValidResume(userData.resume) ? (
            <embed src={userData.resume} type="application/pdf" width="80%" height="80%" />
          ) : (
            <div className={styles.resumePlaceholder}>
              User needs to reupload resume
            </div>
          )}
        </div>
      )}

      {/* 
      {showRating && (
        <div className={styles.modalScore}>
          {renderRatingModal()}
        </div>
      )}
        */}
    </div>
  );
};

export default ProfileHeader;