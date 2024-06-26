import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Ranked from '../../components/RankedFeed';
import Tagged from '../../components/TagsFeed';
import Likes from '../../components/LikesFeed';
import styles from './feed.module.css';
import GameOfLife from '../SiloDescriptionPage/GameOfLife';

const Feed = () => {
  const [FeedStyle, setFeedStyle] = useState('showTagged');
  const { isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return (
      <div style={{ position: 'relative', zIndex: 0 }}>
      <GameOfLife />
      <div className={styles.testTitle}>
        <h1 className={styles.aboutHeader}>About Silo.</h1>
      </div>
      <div className={styles.description}>
        <p>
        Welcome to Silo, the first networking platform designed exclusively for the STEM community.
        Connect with students, professors, recruiters, and investors to showcase your projects, collaborate on research, and expand your professional network. 
        Whether you're looking to gain visibility for your work, find collaborators, or explore top talents, Silo offers a unique, exclusive environment that bridges academia and industry. Join now to innovate, learn, and grow together!
        </p>
      </div>
    </div>
    );
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.navBar}>
        <p>Filter by: </p>
        <p
          className={`${styles.navLink} ${FeedStyle === 'showTagged' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showTagged')}
        >
          Tags
        </p>
        <p
          className={`${styles.navLink} ${FeedStyle === 'showRanked' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showRanked')}
        >
          Top
        </p>
        <p
          className={`${styles.navLink} ${FeedStyle === 'showLikes' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showLikes')}
        >
          My Likes
        </p>
      </div>
      {FeedStyle === 'showRanked' && <Ranked />}
      {FeedStyle === 'showTagged' && <Tagged />}
      {FeedStyle === 'showLikes' && <Likes />}
    </div>
  );
};

export default Feed;
