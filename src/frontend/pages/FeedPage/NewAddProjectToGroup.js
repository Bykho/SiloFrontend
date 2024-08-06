


import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './newAddProjectToGroup.module.css';
import { FaTimes, FaPlus, FaSave } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';

const NewAddProjectToGroup = ({ group, onClose, updateGroupProjects }) => {
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
        
        // Initialize includedProjects with the projects already in the group
        const initialIncludedProjects = returnedProjects
          .filter(project => group.projects.includes(project._id))
          .map(project => project._id);
        setIncludedProjects(initialIncludedProjects);
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
    //console.log('here are the includedProjects: ', includedProjects )
    console.log('here are the group._id: ', group._id )
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/saveProjectToGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: group._id, projectIds: includedProjects }),
      });

      if (!response.ok) {
        throw new Error('Failed to save projects to group');
      }

      const result = await response.json();
      console.log('Successfully saved projects to group:', result);

      updateGroupProjects(includedProjects);
      // Optionally, close the modal or show a success message
      onClose();
    } catch (err) {
      console.error('Error saving projects to group:', err);
    }
  };

  //useEffect(() => {
  //  console.log('ADDPROJECTOGROUP Group parameter:', group);
  //}, [group]);

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Add Projects to Group</h2>
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
                {includedProjects.includes(project._id) ? 'Added' : <FaPlus />} 
              </button>
            </li>
          ))}
        </ul>
        <button className={styles.postProjectsButton} onClick={handleSaveProjectToGroup}>
          <FaSave /> Add Selected Projects to Current Group
        </button>
      </div>
    </div>
  );
};

export default NewAddProjectToGroup;



