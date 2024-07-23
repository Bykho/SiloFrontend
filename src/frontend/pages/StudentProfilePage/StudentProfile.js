


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfile.module.css'; // Import the CSS module
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import AddBlocPortfolio from '../../components/AddBlocPortfolio';
import InfoEditor from '../OLDStudentProfileEditorPage/StudentProfileEditor';
import ShareablePreview from '../../components/ShareablePreview';
import GitPull from '../../components/GitPull';
import config from '../../config';
import { FaWindowClose, FaPlusSquare, FaRegEdit } from 'react-icons/fa';
import { IoSparkles } from "react-icons/io5";


function StudentProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showGitPull, setShowGitPull] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false); // State for ShareablePreview modal
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFiles, setSelectedFiles] = useState([]);


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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    if (location.state && location.state.buildPortfolio) {
      setShowModal(true);
      // Clear the location state after setting the modal to show
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  if (!user || !userData) {
    return <p> Loading ... </p>;
  }

  const handleEditProfileClick = () => {
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  const handleAddProjectClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShareProfileClick = () => {
    setShowSharePreview(true);
  };

  const handleCheckGithubClick = () => {
    setShowGitPull(true);
  };

  const handleCloseGithubPull = () => {
    setShowGitPull(false);
  };

  const handleCloseSharePreview = () => {
    setShowSharePreview(false);
  };

  const handlePortfolioUpdate = (selectedProjects) => {
    setSelectedFiles(selectedProjects);
    setShowGitPull(false);
    setShowModal(true);
  };

  const getLanguageFromFilename = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
      js: 'javascript',
      py: 'python',
      java: 'java',
      html: 'html',
      css: 'css',
      cpp: 'c++',
      c: 'c',
      rb: 'ruby',
      php: 'php',
      rs: 'rust',
      // Add more mappings as needed
    };
    return languageMap[extension] || '';
  };

  const handleSaveProject = (newProject) => {
    setShowModal(false);
    if (newProject) {
      setUserData((prevState) => ({
        ...prevState,
        portfolio: [...prevState.portfolio, newProject],
      }));
    }
  };

  const handleSaveProfile = (newToken = null) => {
    setShowEditor(false);
    if (newToken) {
      localStorage.setItem('token', newToken);
      fetchUserData(); 
    }
  };

  const prepareInitialRows = () => {
    return selectedFiles.map(file => {
      const language = getLanguageFromFilename(file.filePath);
      const cellType = language ? 'code' : 'text';
      return [{
        type: cellType,
        value: file.content,
        language: language
      }];
    });
  };

  return (
    <div>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
      />
      <div className={styles.buttonContainer}>
        <button className={styles.bigButton} onClick={handleAddProjectClick}> <FaPlusSquare /> Add New Project</button>
        <button className={styles.bigButton} onClick={handleEditProfileClick}> <FaRegEdit /> Edit My Profile</button>
        <button className={styles.bigButton} onClick={handleCheckGithubClick}> <IoSparkles /> Generate Projects from GitHub</button>
      </div>
      <div className={styles.contentContainer}>
        {loading ? (
          <p> Loading ... </p>
        ) : error ? (
          <p> Error: {error}</p>
        ) : userData && (
          <PortfolioDisplay user={userData} />
        )}
      </div>
      {showEditor && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseEditor}><FaWindowClose /></button>
            <InfoEditor initLocalData={userData} setUserData={setUserData} onSave={handleSaveProfile} />
          </div>
        </div>
      )}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}><FaWindowClose /></button>
            <AddBlocPortfolio onSave={handleSaveProject} />
          </div>
        </div>
      )}
      {showSharePreview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseSharePreview}><FaWindowClose /></button>
            <ShareablePreview userData={userData} /> {/* Pass user data to ShareablePreview */}
          </div>
        </div>
      )}
      {showGitPull && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseGithubPull}><FaWindowClose /></button>
            <GitPull userData={userData} onPortfolioUpdate={handlePortfolioUpdate} />
          </div>
        </div>
      )}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}><FaWindowClose /></button>
            <AddBlocPortfolio 
              onSave={handleSaveProject} 
              initialRows={prepareInitialRows()}
              initialProjectData={{
                projectName: selectedFiles.length > 0 ? `${selectedFiles[0].repoName} Project` : '',
                projectDescription: `Generated from GitHub repository: ${selectedFiles[0]?.repoName || ''}`,
                tags: ['GitHub', 'Generated'],
                links: [`https://github.com/${userData.github_link}/${selectedFiles[0]?.repoName || ''}`],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;


