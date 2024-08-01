



import React, { useState, useEffect } from 'react';
import styles from './tagsFeed.module.css'; // Import the CSS module
import ProjectEntry from './ProjectEntryPage/ProjectEntry';
import { useUser } from '../contexts/UserContext';
import SmallProjectEntry from './ProjectEntryPage/SmallProjectEntry';
import config from '../config';
import LoadingIndicator from './LoadingIndicator';

const TagsFeed = ({ filteredProjects, loading = null, error = null, userUpvotes, setUserUpvotes }) => {
  const { user } = useUser();

  //useEffect(() => {
  //  console.log('tagsFeed filteredProjects: ', filteredProjects)
  //}, [])

  return (
    <div className={styles.feedContainer}>
      <div className={styles.projectList}>
        {loading ? (
          <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingIndicator />
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredProjects.map((project, index) => (
            <div key={index} className={styles.projectItem}>
              <SmallProjectEntry project={project} userUpvotes={userUpvotes} setUserUpvotes={setUserUpvotes} />
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default TagsFeed;





