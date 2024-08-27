
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import styles from './jobsPage.module.css';

const JobCard = ({ job }) => {
  const truncateDescription = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" component="h2" className={styles.title} gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" className={styles.company} gutterBottom>
          {job.company}
        </Typography>
        <Typography variant="body2" className={styles.location} gutterBottom>
          {job.location}
        </Typography>
        <Typography variant="body2" className={styles.description}>

          {truncateDescription(job.description, 200)}
        </Typography>
        <Button variant="contained" className={styles.applyButton}>
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
