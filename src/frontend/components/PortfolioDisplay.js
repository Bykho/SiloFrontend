


import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './portfolioDisplay.module.css';
import SmallProjectEntry from './ProjectEntryPage/SmallProjectEntry';
import config from '../config';

const PortfolioDisplay = ({ user: passedUser }) => {
  const [userUpvotes, setUserUpvotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUpvotes();
  }, [user._id]);

  //useEffect (() => {
  //  console.log('Portfolio Display userUpvotes: ', userUpvotes)
  //}, [userUpvotes])

  if (loading) {
    return <div>Loading...</div>;  // Display a loading indicator while data is being fetched
  }



  return (
    <div className={styles.container}>
      <div className={styles.projectDirectory}>
        {passedUser.portfolio.map((project, index) => {
          return (
            <SmallProjectEntry
              key={project._id}
              project={project}
              passedUser={passedUser}
              userUpvotes={userUpvotes}
              setUserUpvotes={setUserUpvotes}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioDisplay;
