



import React from 'react';
import styles from './shareablePreview.module.css';
import LayerDisplay from './LayerDisplayForShareable';

const ShareablePreview = ({ userData }) => {
  return (
    <div className={styles.previewContainer}>
      <div className={styles.header}>
        <div>
          <h2>{userData.username}</h2>
          <p>{userData.user_type}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Personal Information</h3>
        <p><strong>Biography:</strong> {userData.biography}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>University:</strong> {userData.university}</p>
        <p><strong>Website:</strong> <a href={userData.personal_website} target="_blank" rel="noopener noreferrer">{userData.personal_website}</a></p>
        <p><strong>GitHub:</strong> <a href={userData.github_link} target="_blank" rel="noopener noreferrer">{userData.github_link}</a></p>
      </div>

      <div className={styles.section}>
        <h3>Skills</h3>
        <ul>
          {userData.skills && userData.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Interests</h3>
        <ul>
          {userData.interests && userData.interests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Experience</h3>
        <ul>
          {userData.orgs && userData.orgs.map((org, index) => (
            <li key={index}>{org}</li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Publications</h3>
        <ul>
          {userData.papers && userData.papers.map((paper, index) => (
            <li key={index}><a href={paper} target="_blank" rel="noopener noreferrer">{paper}</a></li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Projects</h3>
        <ul>
          {userData.portfolio && userData.portfolio.map((project, index) => (
            <li key={index}>
              <p>Author: {project.createdBy}</p>
              <p>{project.projectDescription}</p>
              <LayerDisplay layers={project.layers} />
              <hr className={styles.divider} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3>Links</h3>
        <ul>
          {userData.links && userData.links.map((link, index) => (
            <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShareablePreview;







