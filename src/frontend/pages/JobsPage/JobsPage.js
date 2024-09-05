import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Switch, CircularProgress } from '@mui/material';
import JobCard from './JobCard';
import styles from  './jobsPage.module.css';
import config from '../../config';
import FilterToolbar from './FilterToolbar'; // Import the new component
import {FaSearch} from "react-icons/fa";


const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListView, setIsListView] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ location: '', jobType: '' });
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };


  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.apiBaseUrl}/search_jobs`);
        const data = await response.json();
        console.log('Raw data from API:', data); // Log raw data

        if (!Array.isArray(data)) {
          throw new Error('Received invalid data format');
        }

        const stringifiedJobs = data.map(job => ({
          _id: String(job._id || ''),
          company: String(job.company || ''),
          location: String(job.location || ''),
          job_title: String(job.job_title || ''),
          description: String(job.description || ''),
          final_url: String(job.final_url || ''),
        }));

        console.log('Processed jobs:', stringifiedJobs); // Log processed jobs

        setJobs(stringifiedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
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
    (job.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(job => 
    (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (!filters.jobType || job.job_type === filters.jobType)
  );

  return (
    <Container maxWidth="lg" className={styles.container}>
      <h1 className={styles.titleTop}>
        Top Available Jobs
      </h1>
        <Grid item xs={12} sm={10}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder= "Search keywords..."
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
      <FilterToolbar onFilterChange={handleFilterChange} />
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Loading jobs...
          </Typography>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <Typography variant="h6" color="error">
            Error: {error}
          </Typography>
          <Typography variant="body1">
            Please try refreshing the page or try again later.
          </Typography>
        </div>
      ) : (
        <Grid container spacing={3} className={styles.jobGrid}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={isListView ? 12 : 6} md={isListView ? 12 : 4} key={job._id} className={styles.jobItem}>
              <JobCard job={job} isListView={isListView} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default JobsPage;