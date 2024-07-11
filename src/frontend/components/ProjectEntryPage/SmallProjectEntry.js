

import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaChevronDown, FaChevronUp, FaArrowUp } from 'react-icons/fa';
import styles from './smallProjectEntry.module.css';
import { useUser } from '../../contexts/UserContext';
import CommentSection from './CommentSection';
import config from '../../config';
import ProjectEntry from './ProjectEntry';

const SmallProjectEntry = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const { user, setUser } = useUser();
  const [localUser, setLocalUser] = useState(user);
  const modalRef = useRef(null);
  const descriptionRef = useRef(null);
  const imageRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);

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

  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      return;
    }
    const payload = { username: user.username };

    // Optimistically update the state
    const newUpvoteId = Math.random().toString(36).substring(2, 15); // Generate a temporary ID
    setLocalProject((prevProject) => ({
      ...prevProject,
      upvotes: [...(prevProject.upvotes || []), newUpvoteId],
    }));
    setLocalUser((prevUser) => ({
      ...prevUser,
      upvotes: [...(prevUser.upvotes || []), newUpvoteId],
    }));
    setUser((prevUser) => ({
      ...prevUser,
      upvotes: [...(prevUser.upvotes || []), newUpvoteId],
    }));

    try {
      const response = await fetch(`${config.apiBaseUrl}/upvoteProject/${localProject._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        // Replace the temporary ID with the actual one from the server
        setLocalProject((prevProject) => ({
          ...prevProject,
          upvotes: prevProject.upvotes.map(id => id === newUpvoteId ? data._id : id),
        }));
        setLocalUser((prevUser) => ({
          ...prevUser,
          upvotes: prevUser.upvotes.map(id => id === newUpvoteId ? data._id : id),
        }));
        setUser((prevUser) => ({
          ...prevUser,
          upvotes: prevUser.upvotes.map(id => id === newUpvoteId ? data._id : id),
        }));
      } else {
        console.error('Upvote failed:', data.message);
      }
    } catch (error) {
      console.error('Error during upvote:', error);
      // Rollback optimistic update on failure
      setLocalProject((prevProject) => ({
        ...prevProject,
        upvotes: prevProject.upvotes.filter(id => id !== newUpvoteId),
      }));
      setLocalUser((prevUser) => ({
        ...prevUser,
        upvotes: prevUser.upvotes.filter(id => id !== newUpvoteId),
      }));
      setUser((prevUser) => ({
        ...prevUser,
        upvotes: prevUser.upvotes.filter(id => id !== newUpvoteId),
      }));
    }
  };

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

  const renderUpvotes = () => {
    const hasOverlap = findUpvoteOverlap(localUser, localProject);
    
    return (
      <div className={styles.upvotesContainer}>
        <div className={styles.upvoteItem}>
          <span>{localProject.upvotes?.length || 0}</span>
          <button
            className={hasOverlap ? styles.clickedUpvoteButton : styles.upvoteButton}
            onClick={handleUpvote}
            disabled={hasOverlap}
          >
            <FaArrowUp/>
          </button>
        </div>
      </div>
    );
  };

  const renderDescription = () => (
    <div className={styles.descContainer}>
      <div 
        ref={descriptionRef}
        className={styles.description}
      >
        {localProject.projectDescription}
      </div>
    </div>
  );

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
        {!imgSrc && !textContent && <p>No preview available</p>}
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

  const findUpvoteOverlap = (user, localProject) => {
    if (!Array.isArray(user.upvotes) || !Array.isArray(localProject.upvotes)) {
      return false;
    }
    return user.upvotes.some(userUpvote => localProject.upvotes.includes(userUpvote));
  };

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        {renderUpvotes()}
        <div className={styles.titleAndUsernameContainer}>
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
          <span className={styles.byUsername}>by <span className={styles.username}>{localProject.createdBy}</span></span>
        </div>
        <div className={styles.tagsContainer}>
          {localProject.tags?.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.descAndPreviewContainer}>
        {renderDescription()}
        <div className={styles.previewContainer}>
          {renderContentPreview()}
        </div>
      </div>
      <button className={styles.seeMoreButton} onClick={togglePopup}>
        See Full Project
      </button>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={togglePopup}>
              &times;
            </button>
            <ProjectEntry project={project} passedUser={user} />
          </div>
        </div>
      )}
      <div className={styles.commentBox}>
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

export default SmallProjectEntry;


