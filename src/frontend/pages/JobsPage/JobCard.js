import React from 'react';
import styles from './JobCard.module.css';

const JobCard = ({ job }) => {
  const truncateDescription = (text, charLimit) => {
    if (text.length > charLimit) {
      return text.slice(0, charLimit) + '...';
    }
    return text;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h2 className={styles.title}>{job.job_title}</h2>
        <h3 className={styles.company}>{job.company}</h3>
        <p className={styles.location}>{job.location}</p>
        <p className={styles.description}>
          {truncateDescription(job.description, 150)}
        </p>
        <a
          className={styles.applyButton}
          href={job.final_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default JobCard;