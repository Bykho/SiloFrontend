

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

const SmallProjectEntry = ({ project, UpvoteButton, userUpvotes, setUserUpvotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const { user } = useUser();
  const [localUser, setLocalUser] = useState(user);
  const modalRef = useRef(null);
  const descriptionRef = useRef(null);
  const imageRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(() => {
    // Initialize with the upvotes relevant to this project
    return project.upvotes || [];
  });
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
    // Highlight all code elements when the component mounts or updates
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
      const commentData = { author: user.username, text: commentText, projectId: localProject._id };
      try {
        const response = await fetch(`${config.apiBaseUrl}/handleComment/${user.username}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });
        const data = await response.json();
        if (response.ok) {
          const updatedComments = data.comments;
          setComments(updatedComments);
          setNewComment('');
          setLocalProject((prevProject) => ({
            ...prevProject,
            comments: updatedComments,
          }));
        } else {
          console.error('Failed to add comment:', data.error);
        }
      } catch (error) {
        console.error('Error during adding comment:', error);
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
    };

    const previewTags = tags.slice(0, VISIBLE_TAGS);
    const remainingTags = tags.slice(VISIBLE_TAGS);
    return (
      <div className={styles.tagsContainer}>
        {previewTags.map((tag, index) => (
          <span key={index} className={styles.tag} onClick={() => handleSkillClick(tag)}>
            {tag}
          </span>
        ))}
        {remainingTags.length > 0 && (
          <div className={styles.moreTagsContainer}>
            <span className={styles.moreButton}>+{remainingTags.length} more</span>
          </div>
        )}
      </div>
    );
  };


  const renderContentPreview = () => {
    let imgSrc = null;
    let textContent = null;
    let codeContent = null;
    let codeLanguage = 'plaintext'; // Default language

    for (let layer of localProject.layers) {
      for (let cell of layer) {
        if (cell.type === 'image' && !imgSrc) {
          imgSrc = cell.value;
          break;
        }
        if (cell.type === 'code' && !codeContent) {
          codeContent = cell.value;
          codeLanguage = cell.language || 'plaintext'; // Use the language if provided
        }
        if (cell.type === 'text' && !textContent) {
          textContent = cell.value;
        }
      }
      if (imgSrc) break;
    }

    return (
      <div className={styles.preview}>
        {imgSrc && <img ref={imageRef} src={imgSrc} alt="Project Preview" className={styles.previewImage} />}
        {!imgSrc && codeContent && (
          <div className={styles.codeContainer}>
            <pre className={styles.codePreview}>
              <code className={`language-${codeLanguage}`}>
                {codeContent}
              </code>
            </pre>
          </div>
        )}
        {!imgSrc && !codeContent && textContent && <p className={styles.previewText}>{textContent}</p>}
        {!imgSrc && !codeContent && !textContent && <p></p>}
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
    // Check if the user ID matches and the localProject visibility is defined
    if (String(user._id) === localProject.user_id) {
      if (localProject.visibility == false) {
        return <FaEyeSlash />;
      } else {
        return "";
      }
    }
    return null; // or return any other fallback text or component
  };

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        <UpvoteButton
          project={localProject}
          setProject={setLocalProject}
          passedUser={localUser}
          setPassedUser={setLocalUser}
          userUpvotes={localUpvotes}
          setUserUpvotes={setLocalUpvotes}
        />
        <div className={styles.titleAndUsernameContainer}>
          <span className={styles.visIcon}> {renderVisibilityText()} </span>
          <h3 className={styles.projectTitle} onClick={togglePopup}>{localProject.projectName}</h3>
          <span className={styles.byUsername} onClick={navToProfile}>by <span className={styles.username}>{localProject.createdBy}</span></span>
        </div>
        <div className={styles.tagsContainer}>
          {renderTagsPreview(localProject.tags)}
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.descAndPreviewContainer} onClick={togglePopup}>
        {renderDescription()}
        <div className={styles.previewContainer}>
          {renderContentPreview()}
        </div>
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={togglePopup}>
              &times;
            </button>
            <ProjectEntry project={project} passedUser={user} userUpvotes={userUpvotes} setUserUpvotes={setUserUpvotes} />
          </div>
        </div>
      )}
      <div className={styles.commentBox} onClick={toggleExpand}>
        <div className={styles.commentIconContainer}>
          <FaComment className={styles.commentIcon} />
          <span className={styles.commentText}>Comments...</span>
        </div>
        <button className={styles.expandButton} onClick={toggleExpand}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {renderComments()}
    </div>
  );
};

export default HandleUpvote(SmallProjectEntry);



