




import React, { useState, useEffect, useRef } from 'react';
import EditInPortfolio from '../EditInPortfolio';
import styles from './projectEntry.module.css';
import ProfileImage from '../ProfileImage';
import LayerDisplay from './LayerDisplay';
import { FaEdit, FaComment, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import CommentSection from './CommentSection';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import config from '../../config';

const isStudentProfilePage = window.location.pathname.includes('/studentProfile'); // Adjust this condition based on your routing

const ProjectEntry = ({ project, passedUser }) => {
  /*console.log('here is the passed user: ', passedUser)
  console.log('here is the project, ', project)*/
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [localUser, setLocalUser] = useState(passedUser);
  const { user, setUser } = useUser();
  const modalRef = useRef(null);
  /*console.log('here is the user: ', user)*/

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

  const handleUpvote = async (upvoteType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage');
      return;
    }
    const payload = { username: passedUser.username, upvoteType };
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
      console.log('Response Data:', data);
      if (response.ok) {
        const newUpvoteId = data._id;

        // Update the local project state
        setLocalProject((prevProject) => ({
          ...prevProject,
          [upvoteType]: [...(prevProject[upvoteType] || []), newUpvoteId],
        }));

        // Update the local user state
        setLocalUser((prevUser) => ({
          ...prevUser,
          [upvoteType]: [...(prevUser[upvoteType] || []), newUpvoteId],
        }));

        // Update the user context state
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  }

  const handleCommentUpvote = (index) => {
    const newComments = [...comments];
    newComments[index].upvotes += 1;
    setComments(newComments);
  };


/*
It seems like the handle comment function is using the wrong approach to determining author.
Should be taking from userContext rather than passedUser unless we changge the passed user to be taken from the context, pulled from the backend, and then delivered to projectEntry.
*/
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


  /*this function seems to be obselete*/
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

  const renderProjectLinkButton = (link, label) => {
    return (
      link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className={styles.projectLinkButton}>
          {label}
        </a>
      )
    );
  };

  const findUpvoteOverlap = (upvote_field, user, localProject) => {
    if (!Array.isArray(user[upvote_field]) || !Array.isArray(localProject[upvote_field])) {
      return false;
    }
    for (let userUpvote of user[upvote_field]) {
      for (let projectUpvote of localProject[upvote_field]) {
        if (userUpvote === projectUpvote) {
          return true;
        }
      }
    }
    return false;
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


  console.log('here are localProject.layers in projectEntry: ', localProject.layers);
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
              <span key={index} className={styles.tagStyle}>{tag}</span>
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
        {renderProjectLinkButton(localProject.githubLink, 'GitHub')}
        {renderProjectLinkButton(localProject.projectLink, 'ReadMe')}
      </div>

      <div className={styles.upvoteSectionBox}>
        {['impactful', 'innovative', 'interesting'].map((field) => {
          const upvoteField = `${field}_upvote`;
          const hasOverlap = findUpvoteOverlap(upvoteField, localUser, localProject);
          return (
            <div className={styles.upvoteButtonBox} key={field}>
              <p>{field}: {localProject[upvoteField] ? localProject[upvoteField].length : 0}</p>
              <button
                className={hasOverlap ? styles.clickedUpvoteButton : styles.upvoteButton}
                onClick={() => handleUpvote(upvoteField)}
                disabled={hasOverlap}
              >
                &#x2B06;
              </button>
            </div>
          );
        })}
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





