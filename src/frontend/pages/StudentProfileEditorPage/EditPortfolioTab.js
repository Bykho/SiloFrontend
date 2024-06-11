


import React, { useState } from 'react';
import styles from './studentProfileEditor.module.css';

import config from '../../config';

const EditPortfolioTab = ({
  user,
  showFields,
  toggleField,
  handleInputChange,
  newProject,
  selectedProject,
  setError,
  addProjectToPortfolio,
  updateProjectInPortfolio,
  setSelectedProject,
  setNewProject
}) => {
  const handleProjectSubmit = async () => {
    const token = localStorage.getItem('token');
    console.log('submitting new project:', newProject);
    try {
      const projectData = {
        projectName: newProject.projectName,
        projectDescription: newProject.projectDescription,
        projectLink: newProject.projectLink,
        githubLink: newProject.githubLink,
        media: newProject.media,
        markdown: newProject.markdown,
        tags: newProject.tags
      };

      const response = await fetch(`${config.apiBaseUrl}/addProject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        console.error('Error adding project:', data.message); // Debug log
      } else {
        setError('Project added successfully');
        addProjectToPortfolio(projectData);
        setNewProject({ projectName: '', projectDescription: '', projectLink: '', githubLink: '', media: '', markdown: '', tags: [] });
        console.log('Project added successfully:', projectData); // Debug log

        }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Failed to connect to the server:', err); // Debug log
    }
  };

  const handleProjectUpdateSubmit = async () => {
    const token = localStorage.getItem('token');
    console.log('Updating project:', selectedProject); // Debug log
    try {
      const response = await fetch(`${config.apiBaseUrl}/updateProject/${selectedProject.projectName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedProject)
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        console.error('Error updating project:', data.message); // Debug log
      } else {
        setError('Project updated successfully');
        const projectIndex = user.portfolio.findIndex(project => project.projectName === selectedProject.projectName);
        updateProjectInPortfolio(projectIndex, selectedProject);
        setSelectedProject(null); // Reset selected project after update
        console.log('Project updated successfully:', selectedProject); // Debug log
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Failed to connect to the server:', err); // Debug log
    }
  };

  const handleProjectClick = (project) => {
    if (selectedProject && selectedProject.projectName === project.projectName) {
      setSelectedProject(null);
      return;
    }
    setSelectedProject(project);
  };

  return (
    <>
      <div>
        <button className={styles.addOrSubButton} onClick={() => toggleField('projectName')}>
          {showFields.projectName ? 'Cancel' : 'Add'}
        </button>
      </div>
      {!showFields.projectName && (
        <div className={styles.projectButtons}>
          {user && user.portfolio && user.portfolio.map((project, index) => (
            <button key={index} className={styles.projectButton} onClick={() => handleProjectClick(project)}>
              Edit: {project.projectName}
            </button>
          ))}
        </div>
      )}
      {showFields.projectName && (
        <div className={styles.addForm}>
          <h3>Add:</h3>
          <div className={styles.toggle}>Name</div>
          <input
            type="text"
            value={newProject.projectName}
            onChange={(e) => handleInputChange(e, 'projectName')}
            className={styles.input}
          />

        {/* Here is the code for the clickable buttons on the Add section of the code. */}
          <div className={styles.fieldContainer}>
            <div onClick={() => toggleField('projectDescription')} className={`${styles.toggle} ${showFields.projectDescription ? styles.toggleActive : ''}`}>Description</div>
            <div onClick={() => toggleField('githubLink')} className={`${styles.toggle} ${showFields.githubLink ? styles.toggleActive : ''}`}>GitHub</div>
            <div onClick={() => toggleField('media')} className={`${styles.toggle} ${showFields.media ? styles.toggleActive : ''}`}>Media</div>
            <div onClick={() => toggleField('markdown')} className={`${styles.toggle} ${showFields.markdown ? styles.toggleActive : ''}`}>Markdown</div>
            <div onClick={() => toggleField('projectLink')} className={`${styles.toggle} ${showFields.projectLink ? styles.toggleActive : ''}`}>Project Link</div>
            <div onClick={() => toggleField('tags')} className={`${styles.toggle} ${showFields.tags ? styles.toggleActive : ''}`}>Tags</div>
          </div>

          
        {/* Here is the input fields for the Add section of the code. */}
          <div className={styles.inputDetails}>
            {showFields.projectDescription && <input type="text" onChange={(e) => handleInputChange(e, 'projectDescription')} className={styles.input} placeholder='Project Description' />}
            {showFields.githubLink && <input type="text" value={newProject.githubLink} onChange={(e) => handleInputChange(e, 'githubLink')} className={styles.input} placeholder='GitHub Link' />}
            {showFields.media && <input type="text" value={newProject.media} onChange={(e) => handleInputChange(e, 'media')} className={styles.input} placeholder='Media' />}
            {showFields.markdown && <input type="text" value={newProject.markdown} onChange={(e) => handleInputChange(e, 'markdown')} className={styles.input} placeholder='Markdown' />}
            {showFields.projectLink && <input type="text" value={newProject.projectLink} onChange={(e) => handleInputChange(e, 'projectLink')} className={styles.input} placeholder='Project Link' />}
            {showFields.tags && <input type="text" value={newProject.tags} onChange={(e) => handleInputChange(e, 'tags')} className={styles.input} placeholder='Comma-separated tags' />}
          </div>
          <button className={styles.saveButton} onClick={handleProjectSubmit}>Save Project</button>
        </div>
      )}
      {selectedProject && (
        <div className={styles.projectDetails}>
          <h3>{selectedProject.projectName}</h3>
          <label>
            Description:
            <input type="text" value={selectedProject.projectDescription} onChange={(e) => handleInputChange(e, 'projectDescription')} className={styles.input} />
          </label>
          <label>
            Project Link:
            <input type="text" value={selectedProject.projectLink} onChange={(e) => handleInputChange(e, 'projectLink')} className={styles.input} />
          </label>
          <label>
            GitHub Link:
            <input type="text" value={selectedProject.githubLink} onChange={(e) => handleInputChange(e, 'githubLink')} className={styles.input} />
          </label>
          <label>
            Media:
            <input type="text" value={selectedProject.media} onChange={(e) => handleInputChange(e, 'media')} className={styles.input} />
          </label>
          <label>
            Markdown:
            <input type="text" value={selectedProject.markdown} onChange={(e) => handleInputChange(e, 'markdown')} className={styles.input} />
          </label>
          <label>
            Tags:
            <input type="text" value={selectedProject.tags.join(', ')} onChange={(e) => handleInputChange(e, 'tags')} className={styles.input} placeholder='Comma-separated tags' />
          </label>
          <button className={styles.saveButton} onClick={handleProjectUpdateSubmit}>Save Project</button>
        </div>
      )}
    </>
  );
};

export default EditPortfolioTab;




