
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfile.module.css'; // Import the CSS module
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import AddBlocPortfolio from '../../components/AddBlocPortfolio';
import AddProject from '../../components/AddProjectComponent/AddProject';
import InfoEditor from '../OLDStudentProfileEditorPage/StudentProfileEditor';
import ShareablePreview from '../../components/ShareablePreview';
import GitPull from '../../components/GitPull';
import FileAutoFill from '../../components/FileAutofill';
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
  const [showProjectButtons, setShowProjectButtons] = useState(false); // State to toggle project buttons
  const [showAutofillModal, setShowAutofillModal] = useState(false); // State for Autofill modal
  const [fileToUpload, setFileToUpload] = useState(null); // State for the file to upload
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGitFiles, setSelectedGitFiles] = useState([]);

  const languageLookup = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'javascript', // TypeScript files often use JavaScript syntax highlighting
    tsx: 'javascript',
    py: 'python',
    java: 'java',
    css: 'css',
    html: 'html',
    htm: 'html',
    c: 'c',
    cpp: 'c++',
    h: 'c',
    hpp: 'c++',
    rb: 'ruby',
    php: 'php',
    rs: 'rust',
    // Add more mappings as needed
  };

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

  const handleGitPullUpdate = (selectedProjects) => {
    const processedFiles = selectedProjects.map(file => {
      const extension = file.filePath.split('.').pop().toLowerCase();
      let cellType = 'code';
      let language = languageLookup[extension] || extension;

      if (['txt', 'md'].includes(extension)) {
        cellType = 'text';
        language = '';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
        cellType = 'image';
        language = '';
      } else if (extension === 'pdf') {
        cellType = 'pdf';
        language = '';
      } else if (!languageLookup[extension]) {
        // If the extension is not in our lookup table, default to 'text'
        cellType = 'text';
        language = '';
      }
      return {
        type: cellType,
        value: file.content,
        language: language
      };
    });

    setSelectedGitFiles(processedFiles);
    setShowGitPull(false);
    setShowModal(true);
  };

  const handleEditProfileClick = () => {
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  const handleAddProjectClick = () => {
    // Toggle the display of project buttons and hide the "Add New Project" button and other buttons
    setShowProjectButtons(true);
  };

  const handleBackButtonClick = () => {
    // Toggle back to the original state
    setShowProjectButtons(false);
  };

  const handleBuildFromScratchClick = () => {
    // Open the AddBlocPortfolio modal
    setShowModal(true);
  };

  const handleAutofillClick = () => {
    // Open the Autofill modal
    setShowAutofillModal(true);
  };

  const handleCloseAutofillModal = () => {
    setShowAutofillModal(false);
  };

  const handleFileUploadChange = (e) => {
    console.log("STUDENTPROFILE handleFileUploadChange: triggered")
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGitFiles([]);
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

  const handleSaveProject = (newProject) => {
    setShowModal(false);
    if (newProject) {
      setUserData((prevState) => ({
        ...prevState,
        portfolio: [...prevState.portfolio, newProject],
      }));
    }
    // Reset selectedGitFiles after closing the modal
    setSelectedGitFiles([]);
  };

  const handleSaveProfile = (newToken = null) => {
    setShowEditor(false);
    if (newToken) {
      localStorage.setItem('token', newToken);
      fetchUserData(); 
    }
  };

  return (
    <div>
      <ProfileHeader
        userData={userData}
        loading={loading}
        error={error}
      />
      <div className={styles.buttonContainer}>
        {showProjectButtons ? (
          <div className={styles.buttonContainer}>
            <button className={styles.bigButton} onClick={handleBuildFromScratchClick}>Build From Scratch</button>
            <button className={styles.bigButton} onClick={handleAutofillClick}>Autofill</button>
            <button className={styles.bigButton} onClick={handleBackButtonClick}>Back</button>
          </div>
        ) : (
          <>
            <button className={styles.bigButton} onClick={handleAddProjectClick}> <FaPlusSquare /> Add New Project</button>
            <button className={styles.bigButton} onClick={handleEditProfileClick}> <FaRegEdit /> Edit My Profile</button>
            <button className={styles.bigButton} onClick={handleCheckGithubClick}> <IoSparkles /> Generate Projects from GitHub</button>
          </>
        )}
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
            <AddProject 
              onSave={handleSaveProject} 
              initialRows={selectedGitFiles.length > 0 ? [selectedGitFiles] : []}
              onClose={handleCloseModal}
            />
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
            <GitPull userData={userData} onPortfolioUpdate={handleGitPullUpdate} />
          </div>
        </div>
      )}
      {showAutofillModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseAutofillModal}><FaWindowClose /></button>
            <input 
              type="file"
              onChange={handleFileUploadChange}
              className={styles.fileInput}
            />
          </div>
        </div>
      )}
      {fileToUpload && (
        <FileAutoFill file={fileToUpload} onClose={() => {
          setFileToUpload(null);
          setShowAutofillModal(false);
          fetchUserData();
        }} />
      )}
    </div>
  );
}

export default StudentProfile;





