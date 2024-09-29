
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PortfolioDisplay from '../../components/PortfolioDisplay';
import styles from './studentProfile.module.css';
import { useUser } from '../../contexts/UserContext';
import ProfileHeader from '../../components/ProfileHeader';
import AddBlocPortfolio from '../../components/AddBlocPortfolio';
import AddProject from '../../components/AddProjectComponent/AddProject';
import InfoEditor from '../OLDStudentProfileEditorPage/StudentProfileEditor';
import ShareablePreview from '../../components/ShareablePreview';
import GitPull from '../../components/GitPull';
import FileAutoFill from '../../components/FileAutofill';
import config from '../../config';
import { FaWindowClose, FaPlusSquare, FaRegEdit, FaRegShareSquare, FaGithub } from 'react-icons/fa';
import { IoSparkles } from "react-icons/io5";
import { Plus, Edit2, Share } from 'lucide-react';
import { LuGithub } from "react-icons/lu";
import PublicProfileHeader from "../PublicPortfolioPage/PublicProfileHeader";

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
  const [selectedGitSurroundingInfo, setSelectedGitSurroundingInfo] = useState({});
  const [showCopiedConfirmation, setShowCopiedConfirmation] = useState(false);
  const [portfolioKey, setPortfolioKey] = useState(0);


  const languageLookup = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'javascript',
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
  };


  const handleShareProfile = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/toggleShareProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ user_id: user._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to share profile');
      }
      const modifiedUsername = user.username.replace(/ /g, "_");
      const currentUrl = `${window.location.origin}/public/${modifiedUsername}/${user._id}`;
      navigator.clipboard.writeText(currentUrl).then(() => {
        setShowCopiedConfirmation(true);
        setTimeout(() => {
          setShowCopiedConfirmation(false);
        }, 2000); // Hide the confirmation after 2 seconds
      }).catch((err) => {
        console.error('Failed to copy URL: ', err);
      });
    } catch (err) {
      console.error('Error sharing profile: ', err);
    }
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
    console.log('here is the user data: ', userData)
  }, [userData])


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

  const structureLayers = (files) => {
    const rows = [];
    let currentRow = [];
    files.forEach((file, index) => {
      const isTextOrCode = ['text', 'code'].includes(file.type);
      if (isTextOrCode) {
        let fileObject;
        if (file.type === 'text') {
          fileObject = {
            type: file.type,
            value: file.value,
            textHeader: file.filePath
          };
        } else if (file.type === 'code') {
          fileObject = {
            type: file.type,
            value: file.value,
            textHeader: file.filePath,
            language: file.language
          };
        }
        currentRow.push(fileObject);
        if (currentRow.length === 2 || index === files.length - 1) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });
    return rows;
  };

  const handleGitPullUpdate = (selectedProjects, surroundingInfo) => {
    const processedFiles = selectedProjects.map(file => {
      console.log('STUDENTPROFILE HANDLEGITPULLUPDATE these is file being sent from the backend: ', file);
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
        language: language,
        filePath: file.filePath
      };
    });
    
    console.log('STUDENTPROFILE HANDLEGITPULLUPDATE these is processedFiles: ', processedFiles);
  
    const updatedFiles = structureLayers(processedFiles);
    console.log('STUDENTPROFILE HANDLEGITPULLUPDATE these is updatedFiles: ', updatedFiles);
  
    setSelectedGitFiles(updatedFiles);
    console.log('selectedGitFiles after update:', updatedFiles);
    setSelectedGitSurroundingInfo(surroundingInfo);
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
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleFileButtonClick = () => {
    document.getElementById('fileInput').click();
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
    setSelectedGitFiles([]);
    setSelectedGitSurroundingInfo({});
  };

  const handleCloseSharePreview = () => {
    setShowSharePreview(false);
  };

  const handleSaveProject = async (newProject, deleteInfo) => {
    try {
      setUserData((prevState) => {
        if (newProject) {
          const existingIndex = prevState.portfolio.findIndex(
            (project) => project._id === newProject._id
          );
          if (existingIndex !== -1) {
            const updatedPortfolio = [...prevState.portfolio];
            updatedPortfolio[existingIndex] = newProject;
            return {
              ...prevState,
              portfolio: updatedPortfolio,
            };
          } else {
            return {
              ...prevState,
              portfolio: [newProject, ...prevState.portfolio],
            };
          }
        } else if (deleteInfo && deleteInfo.projectId) {
          const updatedPortfolio = prevState.portfolio.filter(
            (project) => project._id !== deleteInfo.projectId
          );
          return {
            ...prevState,
            portfolio: updatedPortfolio,
          };
        } else {
          return prevState;
        }
      });
      setPortfolioKey(prevKey => prevKey + 1);

      setSelectedGitFiles([]);
  
      const updatedUserData = {
        ...userData,
        portfolio: userData.portfolio,
      };
  
      const filterPortfolio = (data) => {
        if (Array.isArray(data)) {
          return data
            .map(item => filterPortfolio(item))
            .filter(item => item !== null);
        } else if (typeof data === 'object' && data !== null) {
          if (data.type === 'image') {
            return null;
          } else {
            const filteredObject = {};
            for (const key in data) {
              const filteredValue = filterPortfolio(data[key]);
              if (filteredValue !== null) {
                filteredObject[key] = filteredValue;
              }
            }
            return filteredObject;
          }
        } else {
          return data;
        }
      };
  
      const filteredPortfolio = filterPortfolio(updatedUserData.portfolio);
      closeAllModals();
      const newVsScoreData = {
        skills: updatedUserData.skills,
        interests: updatedUserData.interests,
        portfolio: filteredPortfolio,
        major: updatedUserData.major,
      };
  
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/VSprofileScore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newVsScoreData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get response from VSprofileScore');
      }
  
      const result = await response.json();
      console.log('Here is the result from VSprofileScore:', result);
  
      // Update the scores array with the new scores
      setUserData((prevState) => ({
        ...prevState,
        scores: [...prevState.scores, result],
      }));
  
      console.log('VSscoreData sent to backend successfully.');
  
    } catch (error) {
      console.error('Error in handleSaveProject:', error);
    } finally {
      closeAllModals();
    }
  };

  const closeAllModals = () => {
    setShowModal(false);
    setShowEditor(false);
    setShowGitPull(false);
    setShowSharePreview(false);
    setShowAutofillModal(false);
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
          <>
            <button className={styles.bigButtonAdd} onClick={handleBuildFromScratchClick}> <Plus /> Add New Project</button>
            <button className={styles.bigButton} onClick={handleCheckGithubClick}> <LuGithub /> Import from GitHub</button>
            <button className={styles.bigButton} onClick={handleEditProfileClick}> <Edit2 /> Edit My Profile</button>
            <button className={styles.bigButton} onClick={handleShareProfile}> <Share /> Share My Profile</button>
          </>
      </div>
      <div className={styles.contentContainer}>
        {loading ? (
          <p> Loading ... </p>
        ) : error ? (
          <p> Error: {error}</p>
        ) : userData && (
          <PortfolioDisplay user={userData} key={`portfolio-${portfolioKey}-${userData.portfolio.length}`} />
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
            {console.log('Passing initialRows to AddProject: ', selectedGitFiles)}
            {console.log('Passing initialProjectData to AddProject: ', selectedGitSurroundingInfo)}
            <AddProject 
              onSave={handleSaveProject} 
              initialRows={selectedGitFiles.length > 0 ? selectedGitFiles : []}
              initialProjectData={selectedGitSurroundingInfo}
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
            <button className={styles.bigButton} onClick={handleFileButtonClick}>Autofill from File</button>
            <input 
              type="file"
              id="fileInput"
              onChange={handleFileUploadChange}
              className={styles.fileInput}
              style={{ display: 'none' }} // Hide the input field
            />
            <button className={styles.bigButton} >Autofill from GitHub</button>
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

      {showCopiedConfirmation && (
        <div className={styles.copyConfirmation}>URL copied to clipboard!</div>
      )}
    </div>
  );
}

export default StudentProfile;



