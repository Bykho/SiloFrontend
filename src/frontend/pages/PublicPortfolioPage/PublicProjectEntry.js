

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './publicProjectEntry.module.css';
import PublicLayerDisplay from './PublicLayerDisplay';
import { FaEdit, FaGithub, FaGlobe, FaLink } from 'react-icons/fa';
import config from '../../config';

const PublicProjectEntry = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const modalRef = useRef(null);
  const navigate = useNavigate();

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

  const toggleDescription = () => {
    setShowDescription(!showDescription);
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
          <h3 className={styles.projectTitle}>{localProject.projectName}</h3>
        </div>
        <div className={styles.tagsContainer}>
          {localProject.tags?.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      {renderProjectDescription()}
      <div className={styles.layerDisplayContainer}>
        <PublicLayerDisplay layers={localProject.layers} isEditing={isEditing} toggleEdit={toggleEdit} updateLayer={updateLayer} updateProjectDetails={updateProjectDetails} initialProjectData={localProject} />
      </div>
      <div className={styles.buttonContainer}>
        {localProject.links && localProject.links.map((link, index) => (renderLinkButton(link)))}
      </div>
    </div>
  );
};

export default PublicProjectEntry;


