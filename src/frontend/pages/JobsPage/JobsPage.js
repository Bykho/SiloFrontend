import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Grid, TextField, Button, CircularProgress, Paper, Box } from '@mui/material';
import JobCard from './JobCard';
import styles from './jobsPage.module.css';
import config from '../../config';
import FilterToolbar from './FilterToolbar';
import { FaSearch } from "react-icons/fa";

const JobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ location: '', jobType: '' });
  const [viewMode, setViewMode] = useState('suggested');
  const [userData, setUserData] = useState(null);
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.apiBaseUrl}/search_jobs`);
        const data = await response.json();
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
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
        setUserInterests([...data.interests, ...data.skills]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      }
    };
    fetchUserData();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filterJobs = (jobList) => {
    return jobList.filter(job =>
      (job.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(job => 
      (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.jobType || job.job_type === filters.jobType)
    );
  };

  const suggestedJobs = useMemo(() => {
    return jobs.filter(job => {
      const jobText = `${job.job_title} ${job.description}`.toLowerCase();
      return userInterests.some(interest => 
        jobText.includes(interest.toLowerCase()) ||
        interest.toLowerCase().split(' ').some(word => jobText.includes(word))
      );
    });
  }, [jobs, userInterests]);

  const displayedJobs = useMemo(() => {
    const jobsToFilter = viewMode === 'suggested' ? suggestedJobs : jobs;
    return filterJobs(jobsToFilter);
  }, [viewMode, suggestedJobs, jobs, filterJobs, searchTerm, filters]);

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Paper elevation={3} className={styles.headerPaper}>
        <Box className={styles.sliderContainer}>
          <Typography
            variant="h4"
            className={`${styles.sliderOption} ${viewMode === 'suggested' ? styles.activeSlider : ''}`}
            onClick={() => setViewMode('suggested')}
          >
            Suggested Jobs
          </Typography>
          <Typography
            variant="h4"
            className={`${styles.sliderOption} ${viewMode === 'all' ? styles.activeSlider : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Jobs
          </Typography>
          <Box className={`${styles.slider} ${viewMode === 'all' ? styles.sliderRight : ''}`} />
        </Box>
        <Grid container spacing={2} alignItems="center" className={styles.searchContainer}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <FaSearch className={styles.searchIcon} />,
                className: styles.searchInput,
              }}
            />
          </Grid>
        </Grid>
        <FilterToolbar onFilterChange={handleFilterChange} />
      </Paper>
      
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
        <>
          <Typography variant="h6" style={{ marginBottom: '20px' }}>
            Showing {displayedJobs.length} {viewMode === 'suggested' ? 'suggested' : ''} jobs
          </Typography>
          <Grid container spacing={3} className={styles.jobGrid}>
            {displayedJobs.length > 0 ? (
              displayedJobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} key={job._id} className={styles.jobItem}>
                  <JobCard job={job} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" align="center">
                  No jobs found. Try adjusting your filters or switching to "All Jobs".
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default JobsPage;