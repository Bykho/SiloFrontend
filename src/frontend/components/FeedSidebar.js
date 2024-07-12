

import React from 'react';
import styles from './feedSidebar.module.css';

const SidebarItem = ({ icon, text, onClick, isActive }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <a href="#" className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>{icon}</span>
      <span className={styles.sidebarText}>{text}</span>
    </a>
  </li>
);

const FeedSidebar = ({ feedStyle, setFeedStyle }) => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>MY FEED</h2>
      <ul className={styles.sidebarMenu}>
        <SidebarItem icon="🧭" text="Explore" onClick={() => setFeedStyle('explore')} isActive={feedStyle === 'explore'} />
        <SidebarItem icon="🔥" text="Trending" onClick={() => setFeedStyle('trending')} isActive={feedStyle === 'trending'} />
        <SidebarItem icon="🚀" text="Most Upvoted" onClick={() => setFeedStyle('mostUpvoted')} isActive={feedStyle === 'mostUpvoted'} />
        <SidebarItem icon="🏠" text="For You" onClick={() => setFeedStyle('forYou')} isActive={feedStyle === 'forYou'} />
        <SidebarItem icon="👥" text="Groups" onClick={() => setFeedStyle('groups')} isActive={feedStyle === 'groups'} />
      </ul>
    </div>
  );
};

export default FeedSidebar;

