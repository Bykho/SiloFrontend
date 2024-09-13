import React from 'react';
import { FaStar, FaCrown } from 'react-icons/fa';
import styles from './ReferralProgressBar.module.css';

const ReferralProgressBar = ({ referrals = 0 }) => {
  const maxReferrals = 5;
  const progress = (referrals / maxReferrals) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        ></div>
        <div className={styles.milestones}>
          {[0, 1, 3, 5].map((milestone, index) => (
            <div key={index} className={styles.milestone} style={{ left: `${(milestone / maxReferrals) * 100}%` }}>
              <div className={`${styles.milestoneIcon} ${referrals >= milestone ? styles.achieved : ''}`}>
                {milestone === 1 ? 1 : milestone === 3 ? 3 : milestone === 5 ? 5 : milestone}
              </div>
              <div className={styles.milestoneLabel}>
                {milestone === 0 ? 'Start' : 
                 milestone === 1 ? 'Profile Boost' :
                 milestone === 3 ? 'Free Year of Premium' : 
                 'Silo Shirt'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralProgressBar;