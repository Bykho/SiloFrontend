


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EditInPortfolio from '../EditInPortfolio';
import styles from './projectEntry.module.css';
import ProfileImage from '../ProfileImage';
import LayerDisplay from './LayerDisplay';
import { FaEdit, FaComment, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaGithub, FaGlobe, FaLink } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import CommentSection from './CommentSection';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import config from '../../config';

const isStudentProfilePage = window.location.pathname.includes('/studentProfile'); // Adjust this condition based on your routing

const ProjectEntry = ({ project, passedUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [localUser, setLocalUser] = useState(passedUser);
  const { user, setUser } = useUser();
  const modalRef = useRef(null);
  const navigate = useNavigate();

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

  const updateLocalProject = (projectField, newValue) => {
    setLocalProject((prevProject) => ({
      ...prevProject,
      [projectField]: newValue,
    }));
  };

  const updateLayer = (updatedLayers) => {
    setLocalProject((prevProject) => ({
      ...prevProject,
      layers: updatedLayers,
    }));
  };

  const updateProjectDetails = (details) => {
    setLocalProject((prevProject) => ({
      ...prevProject,
      ...details,
    }));
  };

  const ensureProtocol = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'http://' + url;
    }
    return url;
  };

  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      return;
    }
    const payload = { username: passedUser.username };

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
      console.log('Response Data:', data);
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTagClick = (tag) => {
    navigate('/feed', { state: { tag } });
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  }

  const handleCommentUpvote = (index) => {
    const newComments = [...comments];
    newComments[index].upvotes += 1;
    setComments(newComments);
  };

  const handleAddComment = async (commentText) => {
    if (commentText.trim() !== '') {
      const token = localStorage.getItem('token');
      const commentData = { author: passedUser.username, text: commentText, projectId: localProject._id };
      try {
        const response = await fetch(`${config.apiBaseUrl}/handleComment/${passedUser.username}`, {
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

  const renderEditableField = (projectField) => {
    return isEditing && (
      <EditInPortfolio
        project={localProject}
        projectField={projectField}
        project_id={localProject._id}
        updateProject={updateLocalProject}
      />
    );
  };

  const getLinkLabel = (url) => {
    try {
      // Remove protocol if present
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      
      // Split the remaining string by dots
      const parts = cleanUrl.split('.');
      
      // Capitalize the first letter of the first part (main domain name)
      const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      
      return capitalized;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return 'Link';
    }
  };

  const renderLinkButton = (link) => {
    const label = getLinkLabel(link);
    let icon;

    if (link.includes('github.com')) {
      icon = <FaGithub />;
    } else if (link.includes('linkedin.com')) {
      icon = <FaGlobe />;
    } else {
      icon = <FaLink />;
    }

    return (
      <a
        href={ensureProtocol(link)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkButton}
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  };



  const findUpvoteOverlap = (user, localProject) => {
    if (!Array.isArray(user.upvotes) || !Array.isArray(localProject.upvotes)) {
      return false;
    }
    return user.upvotes.some(userUpvote => localProject.upvotes.includes(userUpvote));
  };

  const renderComments = () => {
    if (!isExpanded) return null;
    return (
      <CommentSection
        comments={comments}
        addComment={handleAddComment}
        handleCommentUpvote={handleCommentUpvote}
        user={passedUser}
      />
    );
  };

  const renderProjectDescription = () => {
    const description = localProject.projectDescription;
    const isLongDescription = description.length > 200;
    console.log(localProject); 
    return (
      <div className={styles.projectDescriptionContainer}>
        <div className={`${styles.projDescription} ${isLongDescription && !showDescription ? styles.collapsedDescription : ''}`}>
          {description}
        </div>
        {isLongDescription && (
          <button className={styles.seeMoreButton} onClick={toggleDescription}>
            {showDescription ? 'Less Description' : 'More Description'}
          </button>
        )}
        <div className={styles.divider}></div>
      </div>
    );
  };

  return (
    <div className={styles.projectContainer}>
      {localProject.createdBy && !isStudentProfilePage && (
        <div className={styles.createdByContainer}>
          <ProfileImage username={localProject.createdBy} size="medium" />
          <a href={`/profile/${localProject.createdBy}`}>{localProject.createdBy}</a>
        </div>
      )}
      <div className={styles.projectHeader}>
        <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
        {localProject.tags && (
          <div className={styles.tagsDisplay}>
            {localProject.tags.map((tag, index) => (
              <span key={index} className={styles.tagStyle} onClick={() => handleTagClick(tag)}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {user.username === localProject.createdBy && (
          <button className={styles.editButton} onClick={toggleEdit}>
            <FaEdit />
          </button>
        )}
      </div>
      {renderProjectDescription()}
      <div className={styles.layerDisplayContainer}>
        <LayerDisplay layers={localProject.layers} isEditing={isEditing} toggleEdit={toggleEdit} updateLayer={updateLayer} updateProjectDetails={updateProjectDetails} initialProjectData={localProject} />
      </div>

      <div className={styles.buttonContainer}>
        {localProject.links && localProject.links.map((link, index) => (renderLinkButton(link)))}
      </div>

      <div className={styles.upvoteSectionBox}>
        <div className={styles.upvoteButtonBox}>
          <p>Upvotes: {localProject.upvotes ? localProject.upvotes.length : 0}</p>
          <button
            className={findUpvoteOverlap(localUser, localProject) ? styles.clickedUpvoteButton : styles.upvoteButton}
            onClick={handleUpvote}
            disabled={findUpvoteOverlap(localUser, localProject)}
          >
            &#x2B06;
          </button>
        </div>
        <div className={styles.commentBox}>
          <ProfileImage username={passedUser.username} size="small" />
          <FaComment className={styles.commentIcon} />
          <span className={styles.commentText}>Comments...</span>
          <button className={styles.expandButton} onClick={toggleExpand}>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {renderComments()}
    </div>
  );
};

export default ProjectEntry;


