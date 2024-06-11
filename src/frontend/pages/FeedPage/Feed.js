




import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Ranked from '../../components/RankedFeed';
import Tagged from '../../components/TagsFeed';
import Orged from '../../components/OrgFeed';
import styles from './feed.module.css';

const Feed = () => {
  const [FeedStyle, setFeedStyle] = useState('showTagged');
  const { isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return (
      <div className={styles.feedContainer}>
        <div className={styles.unAuthenticatedText}>
          <h2>Currently In Alpha Release</h2>
          <p>We are currently in our Alpha testing phase. At the moment, we are limiting access to content to ensure we can provide the best possible experience for our users in our next release.</p>
          <p>As a result, to view the feed and other exclusive features, you will need an access key. This allows us to manage the user experience and gather important feedback from a controlled group of users. If you want one, email me at nico@bykhovsky.com</p>
          <p>The Beta stage is coming soon and we will open up broader access and introduce more features. We are moving remarkably fast. Stay tuned.</p>
          <p>We appreciate your interest and support!</p>
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
          className={`${styles.navLink} ${FeedStyle === 'showOrg' ? styles.bold : ''}`}
          onClick={() => setFeedStyle('showOrg')}
        >
          Org
        </p>
      </div>
      {FeedStyle === 'showRanked' && <Ranked />}
      {FeedStyle === 'showTagged' && <Tagged />}
      {FeedStyle === 'showOrg' && <Orged />}
    </div>
  );
};

export default Feed;





