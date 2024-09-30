// AddProject.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './addProject.module.css';
import config from '../../config';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import AutofillProjectFromPDF from '../AddProjectUtility_AutofillProject';
import CleanOrbitingRingLoader from '../FractalLoadingBar';
import MoveModal from './MoveModal';
import Canvas from './Canvas';
import { FaFont, FaImage, FaVideo, FaFilePdf, FaCode, FaTimes, FaCheck, FaExchangeAlt } from 'react-icons/fa';
import { PiPushPinBold } from "react-icons/pi";


const AddProject = ({ initialRows = [], initialProjectData = {}, repo_url = null, onSave = null, onClose = null }) => {
  const [dictInitProjectData, setDictInitProjectData] = useState(typeof initialProjectData === 'string' ? JSON.parse(initialProjectData) : initialProjectData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() =>{
    console.log("here is repoUrl", repo_url)
  },[repo_url])

  useEffect(() => {
    //console.log('ADDPROJECT initialProjectData: ', initialProjectData)
    if (typeof initialProjectData === 'string') {
      try {
        const parsedData = JSON.parse(initialProjectData);
        setDictInitProjectData(parsedData);
      } catch (error) {
        console.error('Failed to parse initialProjectData:', error);
      }
    } else if (typeof initialProjectData === 'object' && initialProjectData !== null) {
      setDictInitProjectData(initialProjectData);
    } else {
      console.log('initialProjectData is of unexpected type:', typeof initialProjectData);
    }
  }, [initialProjectData]);

  const [layers, setRows] = useState(initialRows.length ? initialRows : []);
  const [needsReorganization, setNeedsReorganization] = useState(true);
  const [projectName, setProjectName] = useState(dictInitProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(dictInitProjectData?.projectDescription || '');
  const [tags, setTags] = useState(() => {
    if (Array.isArray(dictInitProjectData?.tags)) {
      return dictInitProjectData.tags.join(', ');
    } else if (typeof dictInitProjectData?.tags === 'string') {
      return dictInitProjectData.tags;
    } else {
      return '';
    }
  });
  
  const [links, setLinks] = useState(() => {
    let initialLinks = '';
    if (Array.isArray(initialProjectData?.links)) {
      initialLinks = initialProjectData.links.join(', ');
    } else if (typeof initialProjectData?.links === 'string') {
      initialLinks = initialProjectData.links;
    }
    
    if (repo_url && !initialLinks.includes(repo_url)) {
      initialLinks = initialLinks ? `${initialLinks}, ${repo_url}` : repo_url;
    }
    
    return initialLinks;
  });

  useEffect(() => {
    if (repo_url) {
      setLinks(prevLinks => {
        let linksArray = [];
        if (typeof prevLinks === 'string') {
          linksArray = prevLinks.split(',').map(link => link.trim());
        } else if (Array.isArray(prevLinks)) {
          linksArray = prevLinks;
        }
        if (!linksArray.includes(repo_url)) {
          return [...linksArray, repo_url].join(', ');
        }
        return prevLinks;
      });
    }
  }, [repo_url]);

  
  const [visibility, setVisibility] = useState(dictInitProjectData?.visibility ?? true);
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [forceComplete, setForceComplete] = useState(false);
  const [fileSize, setFileSize] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState({});
  const [isRearranging, setIsRearranging] = useState(false);


  useEffect(() => {
    if (dictInitProjectData.repo_url) {
      setLinks(prevLinks => {
        let linksArray = [];
        if (typeof prevLinks === 'string') {
          linksArray = prevLinks.split(',').map(link => link.trim());
        } else if (Array.isArray(prevLinks)) {
          linksArray = prevLinks.map(link => link.trim());
        }
        if (!linksArray.includes(dictInitProjectData.repo_url)) {
          return [...linksArray, dictInitProjectData.repo_url].join(', ');
        }
        return prevLinks;
      });
    }
  }, [dictInitProjectData.repo_url]);

  useEffect(() => {
    if (Object.keys(dictInitProjectData).length > 0) {
      setRows(dictInitProjectData.length ? initialRows : []);
      setProjectName(dictInitProjectData.projectName || '');
      setProjectDescription(dictInitProjectData.projectDescription || '');
      setTags(dictInitProjectData.tags || []);
      setLinks(dictInitProjectData.links || []);
      setIsLoading(false); // Set loading to false once data is populated
    }
  }, [initialRows, initialProjectData]);

  const resetProject = () => {
    setProjectName('');
    setProjectDescription('');
    setTags('');
    setLinks('');
    setRows([]);
    setVisibility(true);
    // Reset any other state variables related to project content
  };

  useEffect(() => {
    const updatedPreviewProject = {
      projectName: projectName,
      projectDescription: projectDescription,
      layers: layers,
      tags: tags,
      links: links,
      comments: [],
      upvotes: []
    };
  }, [layers, projectName, projectDescription, tags, links]);

  useEffect(() => {
    if (initialProjectData.layers && initialProjectData.layers.length > 0) {
      setRows(initialProjectData.layers);
    }
  }, [initialProjectData]);

  useEffect(() => {
    if (needsReorganization) {
      reorganizeLayers();
      setNeedsReorganization(false);
    }
  }, [needsReorganization, layers]);

  const reorganizeLayers = () => {
    const newLayers = layers.map(row => {
      if (row.length > 2) {
        return [row[0], row[1]];
      }
      return row;
    });
    setRows(newLayers);
  };

  const toggleRearrange = () => {
    setIsRearranging(!isRearranging);
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    const projectData = {
      projectName,
      projectDescription,
      layers: layers,
      tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [],  // Ensure tags is split if it is a string
      links: typeof links === 'string' ? links.split(',').map(link => link.trim()) : [],
      username: user.username,
      visibility
    };
    if (initialProjectData._id) {
      projectData._id = initialProjectData._id;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/addBlocProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: projectData }),
      });
      if (response.ok) {
        const savedProject = await response.json();
        alert('Project saved successfully');
        if (onSave) {
          onSave(savedProject, null); // Pass savedProject and null
        }
      } else {
        console.error('Error saving project:', response.statusText);
        alert('Error saving project. Please try again.');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId, userId) => {
    console.log('here is projectID: ', projectId);
    console.log('here is userID: ', userId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteProject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, userId }),
      });
      if (response.ok) {
        if (onClose) {
          onClose();
        }
        // Notify parent component that the project was deleted
        if (onSave) {
          onSave(null, { projectId });
        }
      } else {
        console.error('Error deleting project:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleCellTypeChange = (layerIndex, cellIndex, type) => {
    const newLayers = [...layers];
    newLayers[layerIndex][cellIndex] = { ...newLayers[layerIndex][cellIndex], type, value: '' };
    setRows(newLayers);
  };

  const handleCellValueChange = (layerIndex, cellIndex, value) => {
    const newLayers = [...layers];
    newLayers[layerIndex][cellIndex].value = value;
    setRows(newLayers);
  };

  const handleFileChange = (layerIndex, cellIndex, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleCellValueChange(layerIndex, cellIndex, reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCell = (layerIndex, cellIndex) => {
    const newLayers = [...layers];
    newLayers[layerIndex] = newLayers[layerIndex].filter((_, index) => index !== cellIndex);
    if (newLayers[layerIndex].length === 0) {
      newLayers.splice(layerIndex, 1);
    }
    setRows(newLayers);
  };

  const handleMoveClick = (layerIndex, cellIndex) => {
    setSelectedCell({ layerIndex, cellIndex });
  };

  const addCell = (type) => {
    const newLayers = [...layers];
    const lastLayer = newLayers[newLayers.length - 1];
  
    if (lastLayer && lastLayer.length < 2) {
      lastLayer.push({ type, value: '' });
    } else {
      newLayers.push([{ type, value: '' }]);
    }
  
    setRows(newLayers);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleVisibilityChange = () => {
    setVisibility(prevVisibility => !prevVisibility);
    console.log('visibility:', visibility);
  };

  const handleLinksChange = (e) => {
    setLinks(e.target.value);
  };

  const handleLanguageChange = (layerIndex, cellIndex, language) => {
    const newLayers = [...layers];
    newLayers[layerIndex][cellIndex] = { ...newLayers[layerIndex][cellIndex], language };
    setRows(newLayers);
  };

  const handleHeaderChange = (layerIndex, cellIndex, textHeader) => {
    const newLayers = [...layers];
    newLayers[layerIndex][cellIndex] = { ...newLayers[layerIndex][cellIndex], textHeader };
    setRows(newLayers);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const calculateLoadingDuration = (size) => {
    const MB = size / (1024 * 1024);
    const A = 40.7;
    const E = 18;
    const C = 25;
    const D = -8;

    // Calculate the loading duration using the given formula
    const duration = A * Math.tanh(((MB - E) / C) + 1) + D;

    // Return the duration in seconds
    return `${duration.toFixed(2)}s`;
  };

  return (
    <div className={styles.containerWrapper}>
      {isLoading && (
        <div className={styles.loaderOverlay}> 
          < CleanOrbitingRingLoader />
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}> Project Builder  <PiPushPinBold /></h1>
          <AutofillProjectFromPDF
            setProjectName={setProjectName}
            setProjectDescription={setProjectDescription}
            setTags={setTags}
            setLinks={setLinks}
            setRows={setRows}
            setIsLoading={setIsLoading}
            setFileSize={setFileSize}
            resetProject={resetProject}
          />

        </div>
        <div className={styles.projectInfo}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className={styles.projectNameInput}
          />
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Project Description"
            className={styles.projectDescriptionInput}
          />
        </div>
        <div className={styles.toolbar}>
          <p className={styles.toolbarHeader}> Add Content: </p>
          <button onClick={() => addCell('text')} className={styles.toolbarButton}>
            <FaFont /> Text
          </button>
          <button onClick={() => addCell('image')} className={styles.toolbarButton}>
            <FaImage /> Image
          </button>
          <button onClick={() => addCell('video')} className={styles.toolbarButton}>
            <FaVideo /> Video
          </button>
          <button onClick={() => addCell('pdf')} className={styles.toolbarButton}>
            <FaFilePdf /> PDF
          </button>
          <button onClick={() => addCell('code')} className={styles.toolbarButton}>
            <FaCode /> Code
          </button>
          <button onClick={toggleRearrange} className={`${styles.toolbarButton} ${isRearranging ? styles.active : ''}`}>
          <FaExchangeAlt /> {isRearranging ? 'Finish Rearranging' : 'Rearrange'}
        </button>
      </div>
      <Canvas 
        layers={layers}
        setRows={setRows}
        handleCellTypeChange={handleCellTypeChange}
        handleCellValueChange={handleCellValueChange}
        handleFileChange={handleFileChange}
        handleLanguageChange={handleLanguageChange}
        handleHeaderChange={handleHeaderChange}
        handleRemoveCell={handleRemoveCell}
        isValidURL={isValidURL}
        isRearranging={isRearranging}
      />
        <div className={styles.addTagsAndLinks}>
          <input
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="Add tags (comma separated)"
            className={styles.tagInput}
          />
          <input
            type="text"
            value={links}
            onChange={handleLinksChange}
            placeholder="Add links (comma separated)"
            className={styles.linkInput}
          />
        </div>
        <div className={styles.actionButtons}>
          <button 
            className={styles.saveButton} 
            onClick={() => handleSave(projectName, projectDescription, layers, tags, links, user, initialProjectData, onSave)}
            disabled = {isSaving}
            >
              <FaSave className={styles.iconSpacing}/> 
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
          <label className={styles.toggleButton}>
            <input
              type="checkbox"
              checked={visibility}
              onChange={handleVisibilityChange}
              className={styles.toggleCheckbox}
            />
            <span className={styles.toggleSlider}>
              <FaCheck className={styles.checkIcon} />
              <FaTimes className={styles.timesIcon} />
            </span>
            <span className={styles.toggleLabel}>
              {visibility ? 'Visible' : 'Private'}
            </span>
        </label>
          {initialProjectData._id && (
            <button className={styles.deleteButton} onClick={handleDeleteClick}>
              <FaTrash className={styles.iconSpacing}/> Delete Project
            </button>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>All deletions are permanent. Are you sure you want to delete?</h2>
            <div className={styles.modalActions}>
              <button className={styles.modalDeleteButton} onClick={() => handleDelete(initialProjectData._id, user._id, onClose)}>Delete Project</button>
              <button className={styles.modalKeepButton} onClick={handleCloseModal}>Keep Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProject;