

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './gitPull.module.css';

const GitPull = ({ userData }) => {
  const [githubUsernameOrUrl, setGithubUsernameOrUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);

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
    setFiles([]);

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

  const fetchRepoContents = async (repoName) => {
    const username = extractUsername(githubUsernameOrUrl);
    if (!username || !repoName) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }
      const data = await response.json();
      setFiles(data);
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

  return (
    <div className={styles.gitPullContainer}>
      <p>{userData.github_link}</p>
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
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.repoList}>
        {repos.map((repo) => (
          <li key={repo.id} className={styles.repoItem}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
            <button onClick={() => fetchRepoContents(repo.name)}>View Files</button>
          </li>
        ))}
      </ul>
      {selectedRepo && (
        <div className={styles.repoContents}>
          <h3>Contents of {selectedRepo}</h3>
          <ul className={styles.fileList}>
            {files.map((file) => (
              <li key={file.sha} className={styles.fileItem}>
                {file.type === 'file' ? (
                  <button onClick={() => fetchFileContent(file.path)}>{file.name}</button>
                ) : (
                  <span>{file.name} (directory)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

GitPull.propTypes = {
  userData: PropTypes.object.isRequired,
};

export default GitPull;
