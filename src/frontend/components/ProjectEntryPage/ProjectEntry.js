


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
import HandleUpvote from '../wrappers/HandleUpvote';

const isStudentProfilePage = window.location.pathname.includes('/studentProfile'); // Adjust this condition based on your routing

const ProjectEntry = ({ project, passedUser, UpvoteButton, userUpvotes, setUserUpvotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [localUser, setLocalUser] = useState(passedUser);
  const { user, setUser } = useUser();
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  const [comments, setComments] = useState(() => {
    try {
      return JSON.parse(JSON.stringify(project.comments));
    } catch (e) {
      console.error('Failed to parse comments:', e);
      return [];
    }
  });

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
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      const parts = cleanUrl.split('.');
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
      <div className={styles.headerContainer}>
        <div className={styles.titleAndUsernameContainer}>
          <UpvoteButton
            project={localProject}
            setProject={setLocalProject}
            passedUser={localUser}
            setPassedUser={setLocalUser}
            userUpvotes={userUpvotes}
            setUserUpvotes={setUserUpvotes}
          />
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
          <span className={styles.byUsername}>by <span className={styles.username}>{localProject.createdBy}</span></span>
        </div>
        {user.username === localProject.createdBy && (
          <button className={styles.editButton} onClick={toggleEdit}>
            <FaEdit /> Modify Content
          </button>
        )}
      </div>
      <div className={styles.tagsContainer}>
          {localProject.tags?.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      {renderProjectDescription()}

      <div className={styles.layerDisplayContainer}>
        <LayerDisplay layers={localProject.layers} isEditing={isEditing} toggleEdit={toggleEdit} updateLayer={updateLayer} updateProjectDetails={updateProjectDetails} initialProjectData={localProject} />
      </div>

      <div className={styles.buttonContainer}>
        {localProject.links && localProject.links.map((link, index) => (renderLinkButton(link)))}
      </div>

      <div className={styles.commentBox} onClick={toggleExpand}>
        <FaComment className={styles.commentIcon} />
        <span className={styles.commentText}>Comments...</span>
        <button className={styles.expandButton} onClick={toggleExpand}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {renderComments()}
    </div>
  );
};

export default HandleUpvote(ProjectEntry);



