


import React from 'react';
import styles from './profileImage.module.css';

const ProfileImage = ({ username , size = 'medium'}) => {
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  };

  return (
    <div className={`${styles.profileImage} ${styles[size]}`}>
      {getInitials(username)}
    </div>
  );
};

export default ProfileImage;



