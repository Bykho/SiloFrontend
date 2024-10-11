import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CandidateSearch.module.css';
import config from '../../config';
import { FaUpload, FaSearch, FaUser } from 'react-icons/fa';

const CandidateSearch = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('jobDescription', file);

    try {
      const response = await fetch(`${config.apiBaseUrl}/candidateSearch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      console.log("here is the data from /candidatesearch: ", data);
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while searching for candidates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Candidate Search</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fileInputWrapper}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            id="fileInput"
            className={styles.fileInput}
          />
          <label htmlFor="fileInput" className={styles.fileInputLabel}>
            <FaUpload /> {file ? file.name : 'Choose PDF'}
          </label>
        </div>
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Searching...' : <><FaSearch /> Search Candidates</>}
        </button>
      </form>
      {isLoading && <div className={styles.loader}></div>}
      {searchResults && (
        <div className={styles.results}>
          <h2>Search Results</h2>
          <div className={styles.cardContainer}>
            {searchResults.filter(result => result.metadata && result.metadata.username).map((result, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <FaUser className={styles.userIcon} />
                  <h3>{result.metadata.username}</h3>
                </div>
                <div className={styles.cardBody}>
                  <p>Match Score: <span className={styles.score}>{Math.round(result.score * 100)}%</span></p>
                </div>
              </div>
            ))}
          </div>
          {searchResults.filter(result => result.metadata && result.metadata.username).length === 0 && (
            <p className={styles.noResults}>No matching candidates found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;