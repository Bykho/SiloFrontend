import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Switch } from '@mui/material';
import JobCard from './JobCard';
import styles from  './jobsPage.module.css';
import config from '../../config';

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/get_jobs`);
        const data = await response.json();

        // Ensure each field is a string
        const stringifiedJobs = data.map(job => ({
          _id: String(job._id),
          company: String(job.company),
          cities: String(job.cities),
          job_title: String(job.job_title),
          description: String(job.description),
        }));

        setJobs(stringifiedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    console.log('heres jobs: ', jobs);
  }, [jobs]);

  const filteredJobs = jobs.filter(job =>
    (job.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.cities || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );  

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
        Top Available Jobs
      </Typography>
      <Grid container spacing={2} alignItems="center" className={styles.searchContainer}>
        <Grid item xs={12} sm={10}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              style: {
                backgroundColor: '#393939',
                color: '#ffffff',
                borderRadius: '12px',
              },
            }}
            InputLabelProps={{
              style: {
                color: '#9e9e9e',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#4fc3f7',
                },
                '&:hover fieldset': {
                  borderColor: '#03a9f4',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#03a9f4',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <div className={styles.toggleContainer}>
            <Typography variant="body2" className={styles.toggleLabel}>List View</Typography>
            <Switch
              checked={isListView}
              onChange={() => setIsListView(!isListView)}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#03a9f4',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#4fc3f7',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#757575',
                },
                '& .MuiSwitch-thumb': {
                  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                },
              }}
            />
          </div>
        </Grid>
      </Grid>
      <Grid container spacing={3} className={styles.jobGrid}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} sm={isListView ? 12 : 6} md={isListView ? 12 : 4} key={job.id} className={styles.jobItem}>
            <JobCard job={job} isListView={isListView} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobsPage;