
import React, { useState, useEffect } from 'react';
import styles from './groupDisplay.module.css';
import Tagged from '../../components/TagsFeed';
import config from '../../config';

const GroupsFeed = ({ group }) => {
  const [fullProjects, setFullProjects] = useState([]);


  useEffect(() => {
    const fetchProjectsFromIds = async () => {
      //console.log('here is fetchProjectsFromIds: ', group.projects);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ projectIds: group.projects }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const returnedProjects = await response.json();
        //console.log('here are returnedProjects in the fetchProjectFromIds', returnedProjects);
        setFullProjects(returnedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjectsFromIds();
  }, [group.projects]);

  //useEffect (() => {
  //  console.log('fullProjects in GroupsFeed.js: ', fullProjects)
  //}, [fullProjects])

  if (!group) {
    return <div className={styles.noGroup}>No group selected.</div>;
  }

  return (
    <div className={styles.groupContainer}>
        <div>
            <Tagged filteredProjects={fullProjects}/>
        </div>
    </div>
  );
};


export default GroupsFeed;

