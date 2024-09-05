import React, { useState } from 'react';
import styles from './filterToolbar.module.css';

const FilterToolbar = ({ onFilterChange }) => {
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const handleFilterApply = () => {
    onFilterChange({ location, jobType });
  };

  const handleClearFilters = () => {
    setLocation('');
    setJobType('');
    onFilterChange({ location: '', jobType: '' });
  };

  return (
    <div className={styles.filterToolbar}>
      <div className={styles.filterInputGroup}>
        <label htmlFor="location" className={styles.filterLabel}>Location</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={styles.filterInput}
          placeholder="Enter location..."
        />
      </div>
      <div className={styles.filterInputGroup}>
        <label htmlFor="jobType" className={styles.filterLabel}>Job Type</label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
      </div>
      <div className={styles.filterButtons}>
        <button onClick={handleFilterApply} className={styles.applyButton}>
          Apply Filters
        </button>
        <button onClick={handleClearFilters} className={styles.clearButton}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterToolbar;