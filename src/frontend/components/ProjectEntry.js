import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import EditInPortfolio from './EditInPortfolio';
import styles from './projectEntry.module.css';
import ProfileImage from './ProfileImage';
import { FaEdit } from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import config from '../config';

const ProjectEntry = ({ project, passedUser }) => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const updateProject = (updatedUser) => {
    updateUser(updatedUser);
  };
  const images = project.mediaLink ? project.mediaLink.split(',') : [];

  const ImageCarousel = ({ images }) => {
    return (
        <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            showStatus={false}
            interval={3000}
            transitionTime={500}
        >
            {images.map((url, index) => (
                <div key={index}>
                    <img src={url} alt={`carousel-${index}`} />
                </div>
            ))}
        </Carousel>
    );
  };  

  const handleUpvote = async (upvoteType) => {
    const token = localStorage.getItem('token');
    console.log(`Upvoting project_id: ${project.project_id} with type: ${upvoteType}`);
    try {
      const response = await fetch(`${config.apiBaseUrl}/upvoteProject/${project.project_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, upvoteType }),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedProjects = passedUser.portfolio.map((proj) => {
          if (proj.project_id === project.project_id) {
            return { ...proj, [upvoteType]: [...proj[upvoteType], user.username] };
          }
          return proj;
        });
        updateProject({ ...user, portfolio: updatedProjects });
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

  const renderEditableField = (fieldName) => {
    return isEditing && <EditInPortfolio fieldName={fieldName} project={project} />;
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

  return (

    <div className={styles.projectContainer}>
      {project.createdBy && (
        <div className={styles.createdByContainer}>
          <ProfileImage username={project.createdBy} size="medium" />
          <a href={`/profile/${project.createdBy}`}>{project.createdBy}</a>
        </div>
      )}
      <div className={styles.projectHeader}>
        <h3 className={styles.projectTitle}>{project.projectName}</h3>
        <button className={styles.editButton} onClick={toggleEdit}>
          <FaEdit />
        </button>
      </div>

      {project.tags && (
        <div className={styles.tagsDisplay}>
          {project.tags.map((tag, index) => (
            <span key={index} className={styles.tagStyle}>{tag}</span>
          ))}
        </div>
      )}
      <div className={styles.gridContainer}>
        <div className={styles.textContainer}>
          {project.projectDescription && (
            <div className={styles.projDescription}>
              {project.projectDescription}
              {renderEditableField('projectDescription')}
            </div>
          )}
          <div className={styles.additionalInfo}>
            {project.projectLink && (
              <div className={styles.otherFieldDisplay}>
                {project.projectLink}
                {renderEditableField('projectLink')}
              </div>
            )}
            {project.markdownLink && (
              <div className={styles.otherFieldDisplay}>
                {project.markdownLink}
                {renderEditableField('markdownLink')}
              </div>
            )}
            {project.comments && (
              <div className={styles.otherFieldDisplay}>
                {project.comments}
                {renderEditableField('comments')}
              </div>
            )}
          </div>
        </div>
        <div className={styles.mediaContainer}>
            {images && images.length > 0 && (
                <div className={styles.otherFieldDisplay}>
                    <ImageCarousel images={images} />
                    {renderEditableField('mediaLink')}
                </div>
            )}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        {renderProjectLinkButton(project.githubLink, 'GitHub')}
        {renderProjectLinkButton(project.projectLink, 'ReadMe')}
      </div>
      <div className={styles.upvoteSectionBox}>
        {['impactful', 'innovative', 'interesting'].map((field) => (
          <div className={styles.upvoteButtonBox} key={field}>
            <p>{field}: {project[`${field}_upvote`] ? project[`${field}_upvote`].length : 0}</p>
            <button className={styles.upvoteButton} onClick={() => handleUpvote(`${field}_upvote`)}>
              &#x2B06;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectEntry;
