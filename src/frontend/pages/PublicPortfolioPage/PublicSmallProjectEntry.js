

import React, { useState, useEffect, useRef } from 'react';
import { FaComment, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoIosExpand } from 'react-icons/io';
import styles from './publicSmallProjectEntry.module.css';
import config from '../../config';
import ProjectEntry from '../../components/ProjectEntryPage/ProjectEntry';

const PublicSmallProjectEntry = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [localProject, setLocalProject] = useState(project);
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

  const renderDescription = () => (
    <div className={styles.descContainer}>
      <div ref={descriptionRef} className={styles.description}>
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
      <div className={styles.commentSection}>
        {comments.map((comment, index) => (
          <div key={index} className={styles.comment}>
            <p>{comment.text}</p>
            <p>by {comment.author}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.titleAndUsernameContainer} onClick={togglePopup}>
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
        <IoIosExpand /> See Full Project
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

export default PublicSmallProjectEntry;


