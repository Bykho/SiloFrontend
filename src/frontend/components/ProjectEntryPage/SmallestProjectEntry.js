import React, { useState, useEffect, useRef } from 'react';
import styles from './smallestProjectEntry.module.css';
import { useUser } from '../../contexts/UserContext';


const SmallestProjectEntry = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
 
  const [localProject, setLocalProject] = useState(project);
  const { user, setUser } = useUser();
  const modalRef = useRef(null);
  const descriptionRef = useRef(null);



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
  

  const renderDescription = () => (
    <div 
        ref={descriptionRef}
        className={styles.description}
      >
        {localProject.projectDescription}
    </div>
  );

  return (
    <div className={styles.projectContainer}>
      <div className={styles.headerContainer}>
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
      </div>
   </div>
  );
};

export default SmallestProjectEntry;



