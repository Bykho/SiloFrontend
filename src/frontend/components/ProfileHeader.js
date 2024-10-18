import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import styles from './profileHeader.module.css';
import { FaGithub, FaGlobe, FaLink, FaChevronDown, FaChevronUp, FaWindowClose } from 'react-icons/fa';
import { IoMdMail } from "react-icons/io";
import PlayerRatingSpiderweb from './UserSpiderPlot';
import { TbAnalyze } from "react-icons/tb";
import { IoDocument } from "react-icons/io5";
import { Share, Edit2 } from 'lucide-react';
import config from '../config';
import { useUser } from '../contexts/UserContext';
import InfoEditor from '../pages/OLDStudentProfileEditorPage/StudentProfileEditor'; // Adjust the import path

const ProfileHeader = ({ userData, loading, error, onShareProfile, setUserData, isOwnProfile = true }) => {
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
  const [showPortfolioOptions, setShowPortfolioOptions] = useState(false);
  const { user } = useUser();
  const [showEditor, setShowEditor] = useState(false); // Add this line

  const BIO_LENGTH_LIMIT = 300;
  const VISIBLE_TAGS = 2;

  const userSpiderData = userData.scores[userData.scores.length - 1];

  const isValidResume = (resumeData) => {
    return true;
  };

  useEffect(() => {
    if (userData && userData.biography) {
      setBioTruncated(userData.biography.length > BIO_LENGTH_LIMIT);
    }
  }, [userData]);

  const toggleResume = () => {
    console.log('here is the resume: ', userData.resume);
    setShowResume(!showResume);
  };

  const toggleRating = () => {
    setShowRating(!showRating);
  };

  const renderRatingModal = () => (
    <div className={styles.modalContent}>
      <button className={styles.closeButton2} onClick={toggleRating}>
        <FaWindowClose />
      </button>
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
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy URL: ', err);
    });
    console.log('Contact button clicked');
  };

  const renderLinkButton = (link, icon) => {
    let fullLink = ensureProtocol(link);
    let label = getLinkLabel(link);

    if (icon.type === FaGithub) {
      if (!link.includes('github.com') && !link.includes('http')) {
        fullLink = `https://github.com/${link}`;
        label = link;
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
  };

  const ensureProtocol = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  };

  const handleShareProfile = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/toggleShareProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ user_id: user._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to share profile');
      }
      const modifiedUsername = user.username.replace(/ /g, "_");
      const currentUrl = `${window.location.origin}/public/${modifiedUsername}/${user._id}`;
      navigator.clipboard.writeText(currentUrl).then(() => {
        setShowCopiedConfirmation(true);
        setTimeout(() => {
          setShowCopiedConfirmation(false);
        }, 2000);
      }).catch((err) => {
        console.error('Failed to copy URL: ', err);
      });
      onShareProfile(); // Call the callback function to update the parent component
    } catch (err) {
      console.error('Error sharing profile: ', err);
    }
  };

  const handleEditProfileClick = () => {
    setShowEditor(true);
  };

  const handleSaveProfile = () => {
    setShowEditor(false);
    onShareProfile(); // Refresh the user data in StudentProfile.js
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
            <div className={styles.userInfoContainer}>
              <p className={styles.userInfo}>{userData.user_type} | {userData.university} | {userData.major} {userData.grad}</p>
              <button className={styles.contactMeButton} onClick={handleContactButton}> <IoMdMail /> Contact </button>
              <button className={styles.linkButton} onClick={toggleResume}> <IoDocument /> Resume</button>
            </div>
          </div>
          {isOwnProfile && (
            <>
              <button className={`${styles.linkButton} ${styles.editProfileButton}`} onClick={handleEditProfileClick}>
                <Edit2 />
              </button>
              <button className={`${styles.linkButton} ${styles.sharePortfolioButton}`} onClick={handleShareProfile}>
                <Share />
              </button>
            </>
          )}
        </div>
        <div className={styles.tagsContainer}>
          <div className={styles.linksContainer}>
            {userData.github_link && renderLinkButton(userData.github_link, <FaGithub />)}
            {userData.personal_website && renderLinkButton(userData.personal_website, <FaGlobe />)}
            {userData.links && userData.links.map((link, index) => (
              renderLinkButton(link, <FaLink key={index} />)
            ))}
            {showCopiedConfirmation && (
              <div className={styles.copyConfirmation}>
                {showCopiedConfirmation === 'email' ? 'Email copied to clipboard!' : 'URL copied to clipboard!'}
              </div>
            )}
          </div>
          {renderTagsPreview(userData.skills, 'skill')}
          {renderTagsPreview(userData.interests, 'interest')}
        </div>
        <div className={styles.divider}></div>
        <div className={styles.bioContainer}>
          <p className={styles.bio} onClick={toggleBio}>
            {showFullBio ? userData.biography : getTruncatedBio(userData.biography)}
          </p>
          {bioTruncated && (
            <button onClick={toggleBio} className={styles.bioButton}>
              {showFullBio ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          )}
        </div>
      </div>
      {showResume && (
        <div className={styles.resumeModal}>
          <button className={styles.closeButton2} onClick={toggleResume}>
            <FaWindowClose />
          </button>
          {isValidResume(userData.resume) ? (
            <embed src={userData.resume} type="application/pdf" width="80%" height="80%" />
          ) : (
            <div className={styles.resumePlaceholder}>
              User needs to reupload resume
            </div>
          )}
        </div>
      )}
      {showRating && (
        <div className={styles.modalScore}>
          {renderRatingModal()}
        </div>
      )}
      {showEditor && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton2} onClick={() => setShowEditor(false)}>
              <FaWindowClose />
            </button>
            <InfoEditor initLocalData={userData} setUserData={setUserData} onSave={handleSaveProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
