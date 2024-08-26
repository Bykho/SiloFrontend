import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import styles from './jobsPage.module.css';

const JobCard = ({ job }) => {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" component="h2" gutterBottom className={styles.title}>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom className={styles.company}>
          {job.company}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom className={styles.location}>
          {job.location}
        </Typography>
        <Typography variant="body2" className={styles.description}>
          {job.description}
        </Typography>
        <Button variant="contained" className={styles.applyButton}>
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;