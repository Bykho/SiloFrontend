import React from 'react';
import { Compass, Flame, ArrowBigUp, Home } from 'lucide-react';
import styles from './feedSidebar.module.css';

const SidebarItem = ({ Icon, text, onClick, isActive }) => (
  <li className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`} onClick={onClick}>
    <a href="#" className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>
        <Icon size={20} />
      </span>
      <span className={styles.sidebarText}>{text}</span>
    </a>
  </li>
);

const FeedSidebar = ({ feedStyle, setFeedStyle }) => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Feed</h2>
      <ul className={styles.sidebarMenu}>
        <SidebarItem Icon={Compass} text="Explore" onClick={() => setFeedStyle('explore')} isActive={feedStyle === 'explore'} />
        <SidebarItem Icon={Flame} text="Trending" onClick={() => setFeedStyle('trending')} isActive={feedStyle === 'trending'} />
        <SidebarItem Icon={ArrowBigUp} text="Most Upvoted" onClick={() => setFeedStyle('mostUpvoted')} isActive={feedStyle === 'mostUpvoted'} />
        <SidebarItem Icon={Home} text="For You" onClick={() => setFeedStyle('forYou')} isActive={feedStyle === 'forYou'} />
      </ul>
      <div className={styles.sidebarFooter}>
        <p> More features coming soon!</p>
      </div>
    </div>
  );
};

export default FeedSidebar;