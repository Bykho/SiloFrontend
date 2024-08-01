

import React, { useState, useEffect, useRef } from 'react';
import { IoIosExpand } from 'react-icons/io';
import styles from './publicSmallProjectEntry.module.css';
import config from '../../config';
import ProjectEntry from './PublicProjectEntry';

const PublicSmallProjectEntry = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [showPopup, setShowPopup] = useState(false);

  const imageRef = useRef(null);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const togglePopup = () => setShowPopup(!showPopup);

  const renderDescription = () => (
    <div className={styles.descContainer}>
      <div className={styles.description}>
        {localProject.projectDescription}
      </div>
    </div>
  );

  const renderContentPreview = () => {
    let imgSrc = null;
    let textContent = null;
    console.log('localProject.tags', localProject.tags);

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

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.titleAndUsernameContainer} onClick={togglePopup}>
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
        </div>
        <div className={styles.tagsContainer}>
          {localProject.tags?.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.descAndPreviewContainer} onClick={togglePopup} >
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
            <ProjectEntry project={project} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicSmallProjectEntry;


