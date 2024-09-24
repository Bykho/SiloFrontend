import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ResearchPage.module.css';
import config from '../../config';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaRegBookmark, FaBookmark, FaSearch } from "react-icons/fa";
import { FaBookBookmark } from "react-icons/fa6";


const ResearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [error, setError] = useState(null);
  const [savedPapers, setSavedPapers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResearchResults();
    fetchSavedPapers();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, results]);

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

  const fetchSavedPapers = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/get_saved_papers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch saved papers');
      }
      const data = await response.json();
      if (data.status === 'success') {
        setSavedPapers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch saved papers');
      }
    } catch (err) {
      console.error('Error fetching saved papers:', err);
    }
  };

  const savePaper = async (title, url) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/save_paper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, url })
      });
      if (!response.ok) {
        throw new Error('Failed to save paper');
      }
      const data = await response.json();
      if (data.status === 'success') {
        fetchSavedPapers();  // Refresh the list of saved papers
      } else {
        throw new Error(data.message || 'Failed to save paper');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  const filterResults = () => {
    if (searchTerm.trim() === '') {
      setFilteredResults(results);
    } else {
      const filtered = results.filter(result =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredResults(filtered);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    filterResults();
  };


  const SavedPapersModal = () => (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2> Saved Papers</h2>
        <ul>
          {savedPapers.map((paper, index) => (
            <li key={index}>
              <a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.title}</a>
            </li>
          ))}
        </ul>
        <button onClick={() => setShowModal(false)}>Close</button>
      </div>
    </div>
  );

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
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <FaSearch />
          </button>
        </form>
        <button className={styles.savedPapersButton} onClick={() => setShowModal(true)}>
        <FaBookBookmark /> Saved Papers
        </button>
      </div>
      <main className={styles.mainContent}>
        {filteredResults.length > 0 ? (
          <ul className={styles.resultsList}>
            {filteredResults.map((result, index) => (
              <li key={index} className={styles.resultItem}>
              <div className={styles.headerBox}>
                <h2 className={styles.resultTitle}>{result.title}</h2>
                <button 
                  className={styles.saveButton} 
                  onClick={() => savePaper(result.title, result.link)}
                >
                  {savedPapers.some(paper => paper.url === result.link) ? <FaBookmark /> : <FaRegBookmark />}
                </button> 
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
      {showModal && <SavedPapersModal />}
    </div>
  );
};

export default ResearchPage;