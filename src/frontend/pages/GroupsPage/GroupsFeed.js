
import React, { useState, useEffect } from 'react';
import styles from './groupDisplay.module.css';
import Tagged from './TagsFeed';
import config from '../../config';
import { useUser } from '../../contexts/UserContext';

const GroupsFeed = ({ group }) => {
  const [fullProjects, setFullProjects] = useState([]);
  const [userUpvotes, setUserUpvotes] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchProjectsFromIds = async () => {
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
        setFullProjects(returnedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    const fetchUpvotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/getUserUpvotes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({user_id: user._id})
        });
        const data = await response.json();
        if (response.ok) {
          setUserUpvotes(data.upvotes);
        } else {
          console.error('Failed to fetch upvotes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching upvotes:', error);
      }
    };

    fetchProjectsFromIds();
    fetchUpvotes();
  }, [group.projects, user]);

  //useEffect (() => {
  //  console.log('fullProjects in GroupsFeed.js: ', fullProjects)
  //}, [fullProjects])

  if (!group) {
    return <div className={styles.noGroup}>No group selected.</div>;
  }

  return (
    <div className={styles.groupContainer}>
        <div>
          <Tagged filteredProjects={fullProjects} userUpvotes={userUpvotes} setUserUpvotes={setUserUpvotes} />
        </div>
    </div>
  );
};


export default GroupsFeed;

