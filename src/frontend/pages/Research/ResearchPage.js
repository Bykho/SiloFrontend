// ResearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ResearchPage.module.css';
import config from '../../config';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaRegBookmark } from "react-icons/fa";


const ResearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.apiBaseUrl}/query_arxiv`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch research results');
        }
        const data = await response.json();
        if (data.status === 'success') {
          setResults(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch research results');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchResults();
  }, []);

  if (loading) {
    return <div className={styles.loadingMessage}><LoadingIndicator /></div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>Error: {error}</div>;
  }

  return (
    <div className={styles.researchPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Research For You</h1>
        <p className={styles.subtitle}>Discover the latest research papers tailored to your skills, interests and portfolio</p>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
        </div>
        <div className={styles.savedPapers}>
            <button className={styles.savedPapersButton}>Saved Papers</button>
        </div>
      </div>
      <main className={styles.mainContent}>
        {results.length > 0 ? (
          <ul className={styles.resultsList}>
            {results.map((result, index) => (
              <li key={index} className={styles.resultItem}>
                <div className={styles.headerBox}>
                <h2 className={styles.resultTitle}>{result.title}</h2>
                <button className={styles.saveButton}> <FaRegBookmark /> </button> 
                </div> 
                <p className={styles.resultMeta}>
                  Authors: {result.authors.join(', ')} | Published: {result.published}
                </p>
                <p className={styles.resultSummary}>{result.summary}</p>
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resultLink}
                >
                  Read more
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noResultsMessage}>
            No research results found based on your skills and interests.
          </p>
        )}
      </main>
    </div>
  );
};

export default ResearchPage;