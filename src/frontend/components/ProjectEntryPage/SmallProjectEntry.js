import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaChevronDown, FaChevronUp, FaArrowUp } from 'react-icons/fa';
import styles from './smallProjectEntry.module.css';
import { useUser } from '../../contexts/UserContext';
import CommentSection from './CommentSection';
import config from '../../config';

const SmallProjectEntry = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const { user, setUser } = useUser();
  const [localUser, setLocalUser] = useState(user);
  const modalRef = useRef(null);

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
  const toggleDescription = () => setShowFullDescription(!showFullDescription);
  const toggleContent = () => setShowFullContent(!showFullContent);

  const handleUpvote = async (upvoteType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      return;
    }
    const payload = { username: user.username, upvoteType };
    try {
      const response = await fetch(`${config.apiBaseUrl}/upvoteProject/${project._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        const newUpvoteId = data._id;
        setLocalProject((prevProject) => ({
          ...prevProject,
          [upvoteType]: [...(prevProject[upvoteType] || []), newUpvoteId],
        }));
        setLocalUser((prevUser) => ({
          ...prevUser,
          [upvoteType]: [...(prevUser[upvoteType] || []), newUpvoteId],
        }));
        setUser((prevUser) => ({
          ...prevUser,
          [upvoteType]: [...(prevUser[upvoteType] || []), newUpvoteId],
        }));
      } else {
        console.error('Upvote failed:', data.message);
      }
    } catch (error) {
      console.error('Error during upvote:', error);
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
    const upvoteField = 'impactful_upvote';
    const hasOverlap = findUpvoteOverlap(upvoteField, localUser, localProject);
    
    return (
      <div className={styles.upvotesContainer}>
        <div className={styles.upvoteItem}>
          <span>{localProject[upvoteField]?.length || 0}</span>
          <button
            className={hasOverlap ? styles.clickedUpvoteButton : styles.upvoteButton}
            onClick={() => handleUpvote(upvoteField)}
            disabled={hasOverlap}
          >
            <FaArrowUp/>
          </button>
        </div>
      </div>
    );
  };

  const renderDescription = () => (
    <div className={styles.descriptionContainer}>
      <p className={showFullDescription ? styles.fullDescription : styles.truncatedDescription}>
        {localProject.projectDescription}
      </p>
      {localProject.projectDescription.length > 100 && (
        <button className={styles.expandButton} onClick={toggleDescription}>
          {showFullDescription ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      )}
    </div>
  );

  //!! This function is not implemented yet
  //TO DO: Implement rendering of project content preview!
  const renderContentPreview = () => (
    <div className={styles.contentPreviewContainer}>
      <h4>Content Preview</h4>
      <div className={showFullContent ? styles.fullContent : styles.truncatedContent}>
        {/* Replace this with actual content from your project */}
        <p>This is a preview of the project content. It could be a summary of key features, a snippet of code, or any other relevant information.</p>
      </div>
      <button className={styles.expandButton} onClick={toggleContent}>
        {showFullContent ? <FaChevronUp /> : <FaChevronDown />}
      </button>
    </div>
  );

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

  const findUpvoteOverlap = (upvote_field, user, localProject) => {
    if (!Array.isArray(user[upvote_field]) || !Array.isArray(localProject[upvote_field])) {
      return false;
    }
    return user[upvote_field].some(userUpvote => 
      localProject[upvote_field].includes(userUpvote)
    );
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
      {renderDescription()}
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