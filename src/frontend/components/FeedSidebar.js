import React from 'react';
import styles from './feedSidebar.module.css';

const SidebarItem = ({ icon, text }) => (
  <li className={styles.sidebarItem}>
    <a href="#" className={styles.sidebarLink}>
      <span className={styles.sidebarIcon}>{icon}</span>
      <span className={styles.sidebarText}>{text}</span>
    </a>
  </li>
);

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>MY FEED</h2>
      <ul className={styles.sidebarMenu}>
        <SidebarItem icon="🏠" text="For You" />
        <SidebarItem icon="🚀" text="Most Upvoted" />
        <SidebarItem icon="🔥" text="Trending" />
        <SidebarItem icon="🧭" text="Explore" />
        <SidebarItem icon="👥" text="Groups" />
      </ul>
    </div>
  );
};

export default Sidebar;