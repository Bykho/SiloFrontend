import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './gitPull.module.css';
import { GitHub, Folder, File, CheckSquare, Square, ChevronRight, ChevronDown, AlertCircle } from 'react-feather';

const GitPull = ({ userData, onPortfolioUpdate }) => {
  const [githubUsername, setGithubUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noRepos, setNoRepos] = useState(false);

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

  const handleItemToggle = async (repoName, path = '') => {
    const itemKey = `${repoName}:${path}`;
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));

    if (!expandedItems[itemKey]) {
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

  const handleSubmit = () => {
    const selectedProjects = Object.entries(selectedFiles)
      .filter(([, isSelected]) => isSelected)
      .map(([path]) => {
        const [repoName, ...fileParts] = path.split('/');
        return { repoName, filePath: fileParts.join('/') };
      });

    onPortfolioUpdate(selectedProjects);
  };

  const renderTree = (repoName, items, currentPath = '') => {
    if (!items || items.length === 0) return null;

    return (
      <ul className={styles.fileTree}>
        {items.map(item => {
          const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
          const itemKey = `${repoName}:${fullPath}`;
          const isExpanded = expandedItems[itemKey];
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
      {!noRepos && (
        <>
          <ul className={styles.repoList}>
            {repos.map((repo) => (
              <li key={repo.id} className={styles.repoItem}>
                <button
                  className={styles.repoButton}
                  onClick={() => handleItemToggle(repo.name)}
                >
                  {expandedItems[`${repo.name}:`] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  {repo.name}
                </button>
                {expandedItems[`${repo.name}:`] && renderTree(repo.name, repo.contents)}
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