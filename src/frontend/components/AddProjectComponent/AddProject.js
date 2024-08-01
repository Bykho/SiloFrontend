// AddProject.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './addProject.module.css';
import config from '../../config';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import AutofillProjectFromPDF from '../AddProjectUtility_AutofillProject';
import MoveModal from './MoveModal';
import Canvas from './Canvas';
import { FaFont, FaImage, FaVideo, FaFilePdf, FaCode } from 'react-icons/fa';


const AddProject = ({ initialRows = [], initialProjectData = {}, onSave = null, onClose = null }) => {
  const [layers, setRows] = useState(initialRows.length ? initialRows : []);
  console.log('AddProject initialRows:', initialRows);
  console.log('AddProject layers after initialization:', layers);
  const [needsReorganization, setNeedsReorganization] = useState(true);
  const [projectName, setProjectName] = useState(initialProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialProjectData?.projectDescription || '');
  const [tags, setTags] = useState(initialProjectData?.tags || []);
  const [links, setLinks] = useState(initialProjectData?.links || []);
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState({});

  useEffect(() => {
    const updatedPreviewProject = {
      projectName: projectName,
      projectDescription: projectDescription,
      layers: layers,
      tags: tags,
      links: links,
      comments: [],
      upvotes: [],
    };
    setPreviewProject(updatedPreviewProject);
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

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    const projectData = {
      projectName,
      projectDescription,
      layers: layers,
      tags,
      links,
      username: user.username
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
          if (initialProjectData._id) {
            onSave(savedProject.layers, savedProject);
          } else {
            onSave(savedProject);
          }
        }
      } else {
        console.error('Error saving project:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };
  const handleDelete = async (projectId, userId, token, onClose) => {
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

  const handleMove = (direction) => {
    if (!selectedCell) return;
    const { layerIndex, cellIndex } = selectedCell;
    const newLayers = JSON.parse(JSON.stringify(layers));

    switch (direction) {
      case 'up':
        if (layerIndex > 0) {
          const temp = newLayers[layerIndex][cellIndex];
          newLayers[layerIndex][cellIndex] = newLayers[layerIndex - 1][cellIndex] || { type: '', value: '' };
          newLayers[layerIndex - 1][cellIndex] = temp;
        }
        break;
      case 'down':
        if (layerIndex < newLayers.length - 1) {
          const temp = newLayers[layerIndex][cellIndex];
          newLayers[layerIndex][cellIndex] = newLayers[layerIndex + 1][cellIndex] || { type: '', value: '' };
          newLayers[layerIndex + 1][cellIndex] = temp;
        }
        break;
      case 'left':
        if (cellIndex > 0) {
          const temp = newLayers[layerIndex][cellIndex];
          newLayers[layerIndex][cellIndex] = newLayers[layerIndex][cellIndex - 1];
          newLayers[layerIndex][cellIndex - 1] = temp;
        }
        break;
      case 'right':
        if (cellIndex < newLayers[layerIndex].length - 1) {
          const temp = newLayers[layerIndex][cellIndex];
          newLayers[layerIndex][cellIndex] = newLayers[layerIndex][cellIndex + 1];
          newLayers[layerIndex][cellIndex + 1] = temp;
        }
        break;
      default:
        break;
    }

    setRows(newLayers);
    setSelectedCell(null);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value.split(',').map(tags => tags.trim()));
  };

  const handleLinksChange = (e) => {
    setLinks(e.target.value.split(',').map(link => link.trim()));
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

  return (
    <div className={styles.containerWrapper}>
      {isLoading && <div className={styles.spinner}></div>}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Project Builder</h1>
          <AutofillProjectFromPDF
            setProjectName={setProjectName}
            setProjectDescription={setProjectDescription}
            setTags={setTags}
            setLinks={setLinks}
            setRows={setRows}
            setIsLoading={setIsLoading}
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
      </div>
        <Canvas 
          layers={layers}
          handleCellTypeChange={handleCellTypeChange}
          handleCellValueChange={handleCellValueChange}
          handleFileChange={handleFileChange}
          handleLanguageChange={handleLanguageChange}
          handleHeaderChange={handleHeaderChange}
          handleRemoveCell={handleRemoveCell}
          handleMoveClick={handleMoveClick}
          isValidURL={isValidURL}
        />
        <div className={styles.addTagsAndLinks}>
          <input
            type="text"
            value={tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Add tags (comma separated)"
            className={styles.tagInput}
          />
          <input
            type="text"
            value={links.join(', ')}
            onChange={handleLinksChange}
            placeholder="Add links (comma separated)"
            className={styles.linkInput}
          />
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.saveButton} onClick={() => handleSave(projectName, projectDescription, layers, tags, links, user, initialProjectData, onSave)}>
            <FaSave className={styles.iconSpacing}/> Save Project
          </button>
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
      {selectedCell && (
        <MoveModal
          selectedCell={selectedCell}
          handleMove={handleMove}
          setSelectedCell={setSelectedCell}
          layers={layers}
        />
      )}
    </div>
  );
};

export default AddProject;