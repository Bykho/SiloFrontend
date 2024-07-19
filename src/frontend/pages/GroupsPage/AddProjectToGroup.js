

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './addProjectToGroup.module.css';
import { FaTimes } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';

const AddProjectToGroup = ({ group, onClose }) => {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [includedProjects, setIncludedProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnUserProjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user._id }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const returnedProjects = await response.json();
        setProjects(returnedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, [user._id]);

  const toggleIncludeProject = (projectId) => {
    setIncludedProjects((prevIncluded) =>
      prevIncluded.includes(projectId)
        ? prevIncluded.filter((id) => id !== projectId)
        : [...prevIncluded, projectId]
    );
  };

  const handleSaveProjectToGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/saveProjectToGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: group.id, projectIds: includedProjects }),
      });

      if (!response.ok) {
        throw new Error('Failed to save projects to group');
      }

      const result = await response.json();
      console.log('Successfully saved projects to group:', result);
      // Optionally, close the modal or show a success message
      onClose();
    } catch (err) {
      console.error('Error saving projects to group:', err);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Add Project to Group</h2>
        <ul className={styles.projectList}>
          {projects.map((project) => (
            <li key={project._id} className={styles.projectItem}>
              <span>{project.projectName}</span>
              <button
                className={
                  includedProjects.includes(project._id)
                    ? styles.includeButtonActive
                    : styles.includeButton
                }
                onClick={() => toggleIncludeProject(project._id)}
              >
                {includedProjects.includes(project._id) ? 'Included' : 'Include'}
              </button>
            </li>
          ))}
        </ul>
        <button className={styles.postProjectsButton} onClick={handleSaveProjectToGroup}>
          Post Projects to Group
        </button>
      </div>
    </div>
  );
};

export default AddProjectToGroup;



