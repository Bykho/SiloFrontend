

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
  const VISIBLE_TAGS = 4;

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

    for (let layer of localProject.layers) {
      for (let cell of layer) {
        if (cell.type === 'image' && !imgSrc) {
          imgSrc = cell.value;
          break;
        }
      }
      if (imgSrc) break;
    }

    if (!imgSrc) {
      for (let layer of localProject.layers) {
        for (let cell of layer) {
          if (cell.type === 'text' && !textContent) {
            textContent = cell.value;
            break;
          }
        }
        if (textContent) break;
      }
    }

    return (
      <div className={styles.preview}>
        {imgSrc && <img ref={imageRef} src={imgSrc} alt="Project Preview" className={styles.previewImage} />}
        {!imgSrc && textContent && <p className={styles.previewText}>{textContent}</p>}
        {!imgSrc && !textContent && <p></p>}
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

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        <UpvoteButton
          project={localProject}
          setProject={setLocalProject}
          passedUser={localUser}
          setPassedUser={setLocalUser}
          userUpvotes={userUpvotes}
          setUserUpvotes={setUserUpvotes}
        />
        <div className={styles.titleAndUsernameContainer} onClick={togglePopup}>
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
          <span className={styles.byUsername}>by <span className={styles.username}>{localProject.createdBy}</span></span>
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



