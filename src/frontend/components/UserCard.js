


import React from 'react';
import styles from './userSearch.module.css';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Tag } from 'lucide-react';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.userCard}>
      <div className={styles.userHeader}>
        <ProfileImage username={user.username} size='large' />
        <div className={styles.userMainInfo}>
          <h3 className={styles.username}>{user.username}</h3>
          <p className={styles.userType}>
            <User size={16} />
            {user.user_type}
          </p>
        </div>
      </div>
      <div className={styles.userDetails}>
        <p>
          <Mail size={16} />
          {user.email}
        </p>
        <p>
          <Tag size={16} />
          {user.interests ? user.interests.join(', ') : 'No interests listed'}
        </p>
        <p>
          <Briefcase size={16} />
          {user.orgs ? user.orgs.join(', ') : 'No orgs listed'}
        </p>
      </div>
      <button className={styles.viewProfileButton} onClick={() => navigate(`/profile/${user.username}`)}>
        View Profile
      </button>
    </div>
  );
};

export default UserCard;





