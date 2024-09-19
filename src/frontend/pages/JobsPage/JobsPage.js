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
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/search_jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
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
    return jobList.filter(job => {
      const jobText = `${job.job_title} ${job.description}`.toLowerCase();
      const matchesSearch = jobText.includes(searchTerm.toLowerCase());
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      let matchesJobType = true;
      if (filters.jobType === 'full-time') {
        matchesJobType = !jobText.includes('internship') && !jobText.includes('part time') && !jobText.includes('intern');
      } else if (filters.jobType === 'internship') {
        matchesJobType = jobText.includes('internship') || job.job_title.toLowerCase().includes('intern');
      }
      return matchesSearch && matchesLocation && matchesJobType;
    });
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
    <div className={styles.container}>
      <div className={styles.headerPaper}>
      <h1 className={styles.header}>Daily Job Listings</h1>
      <h2 className={styles.subheader}>Every 24 hours, we pull select top job matches from YC, LinkedIn, Indeed, Handshake and more! Keep your profile and projects updated for smarter suggestions.</h2>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        <FilterToolbar onFilterChange={handleFilterChange} />
      </div>
      
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <h2>Loading jobs...</h2>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <h2>Error: {error}</h2>
          <p>Please try refreshing the page or try again later.</p>
        </div>
      ) : (
        <>
          <div className={styles.jobGrid}>
            {displayedJobs.length > 0 ? (
              displayedJobs.map((job) => (
                <div key={job._id} className={styles.jobItem}>
                  <JobCard job={job} />
                </div>
              ))
            ) : (
              <div className={styles.noJobsFound}>
                <h2>No jobs found. Try adjusting your filters.</h2>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default JobsPage;