import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoIosExpand } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import styles from './smallProjectEntry.module.css';
import { useUser } from '../../contexts/UserContext';
import CommentSection from './CommentSection';
import config from '../../config';
import ProjectEntry from './ProjectEntry';
import HandleUpvote from '../wrappers/HandleUpvote';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import VideoPreview from '../VideoPreview';

const SmallProjectEntry = ({
  project,
  UpvoteButton,
  userUpvotes,
  setUserUpvotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [localUser, setLocalUser] = useState(user);
  const modalRef = useRef(null);
  const descriptionRef = useRef(null);
  const imageRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(userUpvotes);
  const hasDescription =
    localProject.projectDescription &&
    localProject.projectDescription.trim() !== '';
  const VISIBLE_TAGS = 3;

  const [comments, setComments] = useState(() => {
    try {
      return JSON.parse(JSON.stringify(project.comments));
    } catch (e) {
      console.error('Failed to parse comments:', e);
      return [];
    }
  });

  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (isEditing) {
          toggleEdit();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [localProject]);

  const toggleEdit = () => setIsEditing(!isEditing);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleContent = () => setShowFullContent(!showFullContent);
  const togglePopup = () => setShowPopup(!showPopup);

  const handleCommentUpvote = (index) => {
    const newComments = [...comments];
    newComments[index].upvotes += 1;
    setComments(newComments);
  };

  const handleAddComment = async (commentText) => {
    if (commentText.trim() !== '') {
      const token = localStorage.getItem('token');
      const commentData = {
        author: user.username,
        text: commentText,
        projectId: localProject._id,
      };
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/handleComment/${user.username}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
          }
        );
        const data = await response.json();
        if (response.ok) {
          const updatedComments = data.comments;
          setComments(updatedComments);
          setNewComment('');
          setLocalProject((prevProject) => ({
            ...prevProject,
            comments: updatedComments,
          }));

          // Create notification
          const notificationPayload = {
            user_id: localProject.user_id,
            type: 'comment',
            message: commentText,
            project_name: localProject.projectName,
            from_user: user.username,
            project_id: localProject._id,
            recipient_id: localProject.user_id,
          };
          const notificationResponse = await fetch(
            `${config.apiBaseUrl}/create_notification`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(notificationPayload),
            }
          );
          if (!notificationResponse.ok)
            throw new Error('Failed to create notification');
          console.log('Notification created successfully');
        } else {
          console.error('Failed to add comment:', data.error);
        }
      } catch (error) {
        console.error(
          'Error during adding comment or creating notification:',
          error
        );
      }
    }
  };

  const renderDescription = () => (
    <div className={styles.descContainer}>
      <div ref={descriptionRef} className={styles.description}>
        {localProject.projectDescription}
      </div>
    </div>
  );

  const handleSkillClick = (skill) => {
    navigate('/GenDirectory', { state: { skill: skill } });
  };

  const renderTagsPreview = (tags) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    if (typeof tags === 'string') {
      tags = tags.split(',').map((tag) => tag.trim());
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return null;
    }

    const previewTags = tags.slice(0, VISIBLE_TAGS);
    const remainingTags = tags.slice(VISIBLE_TAGS);
    return (
      <div className={styles.tagsContainer}>
        {previewTags.map((tag, index) => (
          <span
            key={index}
            className={styles.tag}
            onClick={() => handleSkillClick(tag)}
          >
            {tag}
          </span>
        ))}
        {remainingTags.length > 0 && (
          <div className={styles.moreTagsContainer}>
            <span className={styles.moreButton}>
              +{remainingTags.length} more
            </span>
          </div>
        )}
      </div>
    );
  };

  // New function to check for media content
  const hasMediaContent = () => {
    for (let layer of localProject.layers) {
      for (let cell of layer) {
        if (['image', 'video', 'code'].includes(cell.type)) {
          return true;
        }
      }
    }
    return false;
  };

  const renderContentPreview = () => {
    let imgSrc = null;
    let codeContent = null;
    let codeLanguage = 'plaintext';
    let videoSrc = null;

    for (let layer of localProject.layers) {
      for (let cell of layer) {
        if (cell.type === 'image' && !imgSrc) {
          imgSrc = cell.value;
          break;
        }
        if (cell.type === 'code' && !codeContent) {
          codeContent = cell.value;
          codeLanguage = cell.language || 'plaintext';
        }
        if (cell.type === 'video' && !videoSrc) {
          videoSrc = cell.value;
          break;
        }
      }
      if (imgSrc || codeContent || videoSrc) break;
    }

    if (!imgSrc && !codeContent && !videoSrc) {
      return null;
    }

    return (
      <div className={styles.preview}>
        {imgSrc && (
          <div className={styles.imageContainer}>
            <div
              className={styles.imageBackground}
              style={{ backgroundImage: `url(${imgSrc})` }}
            />
            <img
              ref={imageRef}
              src={imgSrc}
              alt="Project Preview"
              className={styles.previewImage}
            />
          </div>
        )}
        {!imgSrc && videoSrc && <VideoPreview src={videoSrc} />}
        {!imgSrc && !videoSrc && codeContent && (
          <div className={styles.codeContainer}>
            <pre className={styles.codePreview}>
              <code className={`language-${codeLanguage}`}>{codeContent}</code>
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderComments = () => {
    if (!isExpanded) return null;
    return (
      <CommentSection
        comments={comments}
        addComment={handleAddComment}
        handleCommentUpvote={handleCommentUpvote}
        user={user}
      />
    );
  };

  const navToProfile = () => {
    navigate(`/profile/${localProject.user_id}`);
  };

  const renderVisibilityText = () => {
    if (String(user._id) === localProject.user_id) {
      if (localProject.visibility === false) {
        return <FaEyeSlash />;
      } else {
        return '';
      }
    }
    return null;
  };

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.titleAndUsernameContainer}>
          <span className={styles.visIcon}> {renderVisibilityText()} </span>
          <h3 className={styles.projectTitle} onClick={togglePopup}>
            {localProject.projectName}
          </h3>
          <span className={styles.byUsername} onClick={navToProfile}>
            by <span className={styles.username}>{localProject.createdBy}</span>
          </span>
        </div>
        <div className={styles.tagsContainer}>
          {renderTagsPreview(localProject.tags)}
        </div>
      </div>
      <div className={styles.divider} />
      {/* Updated Preview Section */}
      <div className={styles.previewSection} onClick={togglePopup}>
        {hasMediaContent() ? (
          <div className={styles.previewContainer}>
            {renderContentPreview()}
          </div>
        ) : hasDescription ? (
          <div className={styles.previewContainer}>{renderDescription()}</div>
        ) : null}
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={togglePopup}>
              &times;
            </button>
            <ProjectEntry
              project={localProject}
              passedUser={user}
              userUpvotes={localUpvotes}
              setUserUpvotes={setLocalUpvotes}
            />
          </div>
        </div>
      )}
      <div className={styles.upvoteAndCommentContainer}>
        <UpvoteButton
          project={localProject}
          setProject={setLocalProject}
          passedUser={localUser}
          setPassedUser={setLocalUser}
          userUpvotes={localUpvotes}
          setUserUpvotes={setLocalUpvotes}
        />
        <div className={styles.commentBox} onClick={toggleExpand}>
          <div className={styles.commentIconContainer}>
            <FaComment className={styles.commentIcon} />
            <span className={styles.commentText}>Comments</span>
          </div>
          <button className={styles.expandButton} onClick={toggleExpand}>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      {renderComments()}
    </div>
  );
};

export default HandleUpvote(SmallProjectEntry);
