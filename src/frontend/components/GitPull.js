import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './gitPull.module.css';
import { GitHub, Folder, File, CheckSquare, Square, ChevronRight, ChevronDown, AlertCircle } from 'react-feather';
import config from '../config';

const GitPull = ({ userData, onPortfolioUpdate }) => {
  const [githubUsername, setGithubUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [expandedRepo, setExpandedRepo] = useState(null);
  const [expandedSubItems, setExpandedSubItems] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noRepos, setNoRepos] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');


  useEffect(() => {
    if (userData.github_link) {
      const username = extractUsername(userData.github_link);
      setGithubUsername(username);
      fetchRepos(username);
    }
  }, [userData.github_link]);

  const extractUsername = (input) => {
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/;
    const match = input.match(urlPattern);
    return match ? match[1] : input;
  };

  const fetchFileContent = async (repoName, filePath) => {
    if (!githubUsername || !repoName || !filePath) return null;
    try {
      const response = await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`);
      if (!response.ok) throw new Error('Failed to fetch file content');
      const data = await response.json();
      return atob(data.content);
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      return null;
    }
  };

  const fetchRepos = async (username) => {
    if (!username) return;
    setLoading(true);
    setError('');
    setNoRepos(false);

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepos(data);
      if (data.length === 0) {
        setNoRepos(true);
      }
    } catch (err) {
      setError('Failed to fetch repositories. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async (repoName, path = '') => {
    if (!githubUsername || !repoName) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${path}`);
      if (!response.ok) throw new Error('Failed to fetch contents');
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to fetch contents. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleRepoToggle = async (repoName) => {
    if (expandedRepo === repoName) {
      setExpandedRepo(null); // Collapse the repo if it's already expanded
    } else {
      setExpandedRepo(repoName); // Expand the repo
      const contents = await fetchContents(repoName);
      setRepos(prev => prev.map(repo => repo.name === repoName ? { ...repo, contents } : repo));
    }
  };

  const handleItemToggle = async (repoName, path = '') => {
    const itemKey = `${repoName}:${path}`;
    setExpandedSubItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));

    if (!expandedSubItems[itemKey]) {
      const contents = await fetchContents(repoName, path);
      setRepos(prev => {
        const updateNestedContents = (items) => {
          return items.map(item => {
            if (item.name === repoName && !path) {
              return { ...item, contents };
            } else if (item.path === path) {
              return { ...item, contents };
            } else if (item.contents) {
              return { ...item, contents: updateNestedContents(item.contents) };
            }
            return item;
          });
        };
        return updateNestedContents(prev);
      });
    }
  };

  const handleFileToggle = (repoName, filePath) => {
    setSelectedFiles(prev => ({
      ...prev,
      [`${repoName}/${filePath}`]: !prev[`${repoName}/${filePath}`]
    }));
  };

  const handleSubmit = async () => {
    const selectedProjects = await Promise.all(
      Object.entries(selectedFiles)
        .filter(([, isSelected]) => isSelected)
        .map(async ([path]) => {
          const [repoName, ...fileParts] = path.split('/');
          const filePath = fileParts.join('/');
          const content = await fetchFileContent(repoName, filePath);
          const language = filePath.split('.').pop(); // Get file extension as language
          return { repoName, filePath, content, language };
        })
    );

    // Prepare data for API request
    const requestData = {
      user: githubUsername,
      projects: selectedProjects
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/newSplittingMethodForCodeAutofill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('API response status:', response.status);
      console.log('API response object:', response);

      if (!response.ok) {
        if (response.status === 413) {
          setApiErrorMessage('The combined code exceeds the maximum allowed limit for processing. Please select fewer files.');
          throw new Error('The combined code exceeds the maximum allowed limit for processing. Please select fewer files.');
        } else {
          setApiErrorMessage('Failed to add projects to portfolio. Please try again.');
          throw new Error('Failed to add projects to portfolio');
        }
      }

      const result = await response.json();
      console.log('API response:', result);
      console.log('API response.summary_content: ', result.summary_content)
      console.log('API response surrounding_summary: ', result.surrounding_summary)
      if (!Array.isArray(result.summary_content)) {
        console.log('summary_content is not an array');
      }

      const combinedData = [
        ...selectedProjects,
        ...result.summary_content.map(item => {
          // Extract the key and value from the single key-value pair object
          const key = Object.keys(item)[0];
          const value = item[key];
          return { repoName: null, filePath: key, content: value, language: 'text' };
        })
      ];
      console.log("GITPULL HANDLESUBMIT combinedData: ", combinedData)

      onPortfolioUpdate(combinedData, result.surrounding_summary);
      setApiErrorMessage('');
    } catch (error) {
      console.error('Error adding projects to portfolio:', error);
      alert('Failed to add projects to portfolio. Please try again.');
    }
  };

  const closeModal = () => {
    setApiErrorMessage('');
  };

  const renderTree = (repoName, items, currentPath = '') => {
    if (!items || items.length === 0) return null;

    return (
      <ul className={styles.fileTree}>
        {items.map(item => {
          const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
          const itemKey = `${repoName}:${fullPath}`;
          const isExpanded = expandedSubItems[itemKey];
          const isSelected = selectedFiles[`${repoName}/${fullPath}`];

          if (item.type === 'dir') {
            return (
              <li key={item.sha} className={styles.fileItem}>
                <button
                  className={styles.folderToggle}
                  onClick={() => handleItemToggle(repoName, fullPath)}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Folder size={16} className={styles.icon} />
                  <span>{item.name}</span>
                </button>
                {isExpanded && item.contents && renderTree(repoName, item.contents, fullPath)}
              </li>
            );
          } else {
            return (
              <li key={item.sha} className={styles.fileItem}>
                <button
                  className={styles.fileToggle}
                  onClick={() => handleFileToggle(repoName, fullPath)}
                >
                  {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  <File size={16} className={styles.icon} />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div className={styles.gitPullContainer}>
      <h2 className={styles.heading}>
        <GitHub className={styles.headingIcon} />
        Generate Projects from GitHub
      </h2>
      <p className={styles.subtitle}>Select relevant files from your repos that you would like to add to your portfolio:</p>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className={styles.input}
        />
        <button onClick={() => fetchRepos(githubUsername)} className={styles.fetchButton}>
          Fetch Repos
        </button>
      </div>
      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {noRepos && (
        <div className={styles.noRepos}>
          <AlertCircle className={styles.alertIcon} />
          <p>No public repositories found for this user.</p>
        </div>
      )}
      {apiErrorMessage && (
        <>
          <div className={styles.apiErrorBackdrop} onClick={closeModal}></div>
          <div className={styles.apiErrorModal}>
            <button className={styles.apiErrorCloseButton} onClick={closeModal}>×</button>
            <p className={styles.apiErrorText}>{apiErrorMessage}</p>
          </div>
        </>
      )}
      {!noRepos && (
        <>
          <ul className={styles.repoList}>
            {repos.map((repo) => (
              <li key={repo.id} className={styles.repoItem}>
                <button
                  className={styles.repoButton}
                  onClick={() => handleRepoToggle(repo.name)}
                >
                  {expandedRepo === repo.name ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  {repo.name}
                </button>
                {expandedRepo === repo.name && renderTree(repo.name, repo.contents)}
              </li>
            ))}
          </ul>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Add Selected to Portfolio
          </button>
        </>
      )}
    </div>
  );
};

GitPull.propTypes = {
  userData: PropTypes.object.isRequired,
  onPortfolioUpdate: PropTypes.func.isRequired,
};

export default GitPull;



