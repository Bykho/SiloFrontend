


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
  useEffect(() => {
    console.log('Initial Project: ', project);
    console.log('Initial Project Tags: ', project.tags);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [localProject, setLocalProject] = useState(() => {
    const processedProject = {
      ...project,
      tags: Array.isArray(project.tags) 
        ? project.tags 
        : (typeof project.tags === 'string' ? project.tags.split(',').map(tag => tag.trim()) : []),
      links: Array.isArray(project.links) 
        ? project.links 
        : (typeof project.links === 'string' ? project.links.split(',').map(link => link.trim()) : []),
      layers: Array.isArray(project.layers) 
        ? project.layers 
        : (typeof project.layers === 'string' ? project.layers.split(',').map(layer => layer.trim()) : [])
    };
  
    console.log('Processed Local Project: ', processedProject);
    return processedProject;
  });
  
  

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
    console.log('LocalProject after state initialization: ', localProject);
  }, [localProject]);


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
      [projectField]: projectField === 'tags' || projectField === 'links'
        ? (Array.isArray(newValue) ? newValue : newValue.split(',').map(item => item.trim()))
        : newValue,
    }));
  };

  const updateLayer = (updatedData) => {
    if (!updatedData) return; // Early return if updatedData is null
  
    console.log('Received updatedData:', updatedData);
    
    const updatedLayers = Array.isArray(updatedData.layers) ? updatedData.layers : [];
    
    console.log('Extracted updatedLayers:', updatedLayers);
  
    setLocalProject((prevProject) => ({
      ...prevProject,
      ...updatedData,
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
          const notificationResponse = await fetch(`${config.apiBaseUrl}/create_notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload)
          });
          if (!notificationResponse.ok) throw new Error('Failed to create notification');
          console.log('Notification created successfully');
        } else {
          console.error('Failed to add comment:', data.error);
        }
      } catch (error) {
        console.error('Error during adding comment or creating notification:', error);
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

  const renderLinkButton = (links) => {
    if (typeof links === 'string') {
      links = links.split(',').map(item => item.trim());
    }
  
    return links.map((singleLink, index) => {
      const label = getLinkLabel(singleLink);
      let icon = singleLink.includes('github.com') ? <FaGithub /> : singleLink.includes('linkedin.com') ? <FaGlobe /> : <FaLink />;
  
      return (
        <a key={index} href={ensureProtocol(singleLink)} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
          {icon}
          <span>{label}</span>
        </a>
      );
    });
  };
  
  
  useEffect(() => {
    console.log("here is localProject.layers: ", localProject.layers)
  }, [localProject.layers])

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

  const navToProfile = () => {
    navigate(`/profile/${localProject.user_id}`);
  };

  const renderProjectDescription = () => {
    const description = localProject.projectDescription;
    const isLongDescription = description.length > 200;
    return (
      <div className={styles.projectDescriptionContainer} onClick={toggleDescription}>
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
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
          <span className={styles.byUsername}>by <span className={styles.username} onClick={navToProfile}>{localProject.createdBy}</span></span>
        </div>
        {String(user._id) === localProject.user_id && (
          <button className={styles.editButton} onClick={toggleEdit}>
            <FaEdit /> Modify Content
          </button>
        )}
      </div>
      <div className={styles.tagsContainer}>
        {Array.isArray(localProject.tags) 
          ? localProject.tags.map((tag, index) => (
              <span key={index} className={styles.tag} onClick={() => handleTagClick(tag)}>
                {tag}
              </span>
            ))
          : null
        }
      </div>
      {renderProjectDescription()}

      <div className={styles.layerDisplayContainer}>
        <LayerDisplay layers={localProject.layers} isEditing={isEditing} toggleEdit={toggleEdit} updateLayer={updateLayer} updateProjectDetails={updateProjectDetails} initialProjectData={localProject} />
      </div>

      <div className={styles.buttonContainer}>
        {localProject.links && renderLinkButton(localProject.links)}
      </div>
      <div className={styles.upvoteAndCommentContainer}>
      <UpvoteButton
            project={localProject}
            setProject={setLocalProject}
            passedUser={localUser}
            setPassedUser={setLocalUser}
            userUpvotes={userUpvotes}
            setUserUpvotes={setUserUpvotes}
          />
      <div className={styles.commentBox} onClick={toggleExpand}>
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

export default HandleUpvote(ProjectEntry);



