

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './gitPull.module.css';

const GitPull = ({ userData }) => {
  const [githubUsernameOrUrl, setGithubUsernameOrUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pressedRepos, setPressedRepos] = useState({});
  const [autoFilling, setAutoFilling] = useState(false);

  useEffect(() => {
    if (userData.github_link) {
      setGithubUsernameOrUrl(userData.github_link);
    }
  }, [userData.github_link]);

  const handleInputChange = (e) => {
    setGithubUsernameOrUrl(e.target.value);
  };

  const extractUsername = (input) => {
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/;
    const match = input.match(urlPattern);
    return match ? match[1] : input;
  };

  const fetchRepos = async () => {
    const username = extractUsername(githubUsernameOrUrl);
    if (!username) return;
    setLoading(true);
    setError('');
    setSelectedRepo(null);
    setFileTree({});
    setPressedRepos({});

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError('Failed to fetch repositories. Please check the username or URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoContents = async (repoName, path = '') => {
    const username = extractUsername(githubUsernameOrUrl);
    if (!username || !repoName) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${path}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }
      const data = await response.json();
      setFileTree((prevFileTree) => ({
        ...prevFileTree,
        [`${repoName}/${path}`]: data
      }));
      setSelectedRepo(repoName);
    } catch (err) {
      setError('Failed to fetch repository contents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath) => {
    const username = extractUsername(githubUsernameOrUrl);
    if (!username || !selectedRepo || !filePath) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${selectedRepo}/contents/${filePath}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      const data = await response.json();
      const fileContent = atob(data.content); // Decode Base64 content
      alert(`Content of ${filePath}:\n\n${fileContent}`);
    } catch (err) {
      setError('Failed to fetch file content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isUserFile = (fileName) => {
    const userFileExtensions = ['.js', '.py', '.html'];
    return userFileExtensions.some((ext) => fileName.endsWith(ext));
  };

  const renderFileTree = (repoName, path = '') => {
    const key = `${repoName}/${path}`;
    const files = fileTree[key];
    if (!files) return null;

    return (
      <div className={styles.fileTree}>
        {'Relevant files found:'}
        {files
          .filter((file) => file.type === 'file' && (file.name.toLowerCase() === 'readme.md' || isUserFile(file.name)))
          .map((file) => (
            <div key={file.sha} className={styles.fileItem}>
              <a href={file.html_url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </div>
          ))}
      </div>
    );
  };

  const toggleRepoPressed = (repoName) => {
    setPressedRepos((prevPressedRepos) => ({
      ...prevPressedRepos,
      [repoName]: !prevPressedRepos[repoName]
    }));
  };

  const handleSubmit = () => {
    setAutoFilling(true);
    setTimeout(() => {
      setAutoFilling(false);
      // Logic for auto-filling the portfolio can go here.
    }, 2000);
  };

  return (
    <div className={styles.gitPullContainer}>
      <h2 className={styles.heading}>Autofill Portfolio from GitHub</h2>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={githubUsernameOrUrl}
          onChange={handleInputChange}
          placeholder="Enter GitHub username or URL"
          className={styles.input}
        />
        <button onClick={fetchRepos} className={styles.fetchButton}>
          Fetch Repos
        </button>
      </div>
      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.repoList}>
        {repos.map((repo) => (
          <li key={repo.id} className={styles.repoItem}>
            <button
              className={`${styles.repoButton} ${pressedRepos[repo.name] ? styles.pressed : ''}`}
              onClick={() => {
                toggleRepoPressed(repo.name);
                fetchRepoContents(repo.name);
              }}
            >
              {repo.name}
            </button>
            {pressedRepos[repo.name] && renderFileTree(repo.name)}
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit} className={styles.submitButton}>
        Submit Autofilled Portfolio
      </button>
      {autoFilling && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
          <p>AutoFilling out Portfolio...</p>
        </div>
      )}
    </div>
  );
};

GitPull.propTypes = {
  userData: PropTypes.object.isRequired,
};

export default GitPull;


