// AddProject.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './addProject.module.css';
import config from '../../config';
import { FaPlus, FaSave, FaTrash, FaArrowsAlt, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import AutofillProjectFromPDF from '../AddProjectUtility_AutofillProject';
import MoveModal from './MoveModal';
import ProjectCell from './ProjectCell';
import { isValidURL, handleSave, handleDelete, reorganizeRows, handleMove } from './ProjectHelperFunctions';

const AddProject = ({ initialRows = [], initialProjectData = {}, onSave = null, onClose = null }) => {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [[{ type: '', value: '' }]]);
  const [needsReorganization, setNeedsReorganization] = useState(true);
  const [projectName, setProjectName] = useState(initialProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialProjectData?.projectDescription || '');
  const [tags, setTags] = useState(initialProjectData?.tags || []);
  const [links, setLinks] = useState(initialProjectData?.links || []);
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading ] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState({});

  useEffect(() => {
    const updatedPreviewProject = {
      projectName: projectName,
      projectDescription: projectDescription,
      layers: rows,
      tags: tags,
      links: links,
      comments: [],
      upvotes: [],
    };
    setPreviewProject(updatedPreviewProject);
  }, [rows, projectName, projectDescription, tags, links]);

  useEffect(() => {
    if (needsReorganization) {
      setRows(reorganizeRows(rows));
      setNeedsReorganization(false);
    }
  }, [needsReorganization, rows]);

  const handleAddRow = () => {
    setRows([...rows, [{ type: '', value: '' }]]);
  };

  const handleMoveClick = (rowIndex, cellIndex) => {
    setSelectedCell({ rowIndex, cellIndex });
  };

  const handleAddCell = (rowIndex) => {
    if (rows[rowIndex].length < 2) {
      const newRows = [...rows];
      newRows[rowIndex] = [...newRows[rowIndex], { type: '', value: '' }];
      setRows(newRows);
    }
  };

  const handleCellTypeChange = (rowIndex, cellIndex, type) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], type, value: '' };
    setRows(newRows);
  };

  const handleCellValueChange = (rowIndex, cellIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex].value = value;
    setRows(newRows);
  };

  const handleFileChange = (rowIndex, cellIndex, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleCellValueChange(rowIndex, cellIndex, reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCell = (rowIndex, cellIndex) => {
    const newRows = [...rows];
    newRows[rowIndex] = newRows[rowIndex].filter((_, index) => index !== cellIndex);
    if (newRows[rowIndex].length === 0) {
      newRows.splice(rowIndex, 1);
    }
    setRows(newRows);
  };


  const handleTagsChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
  };

  const handleLinksChange = (e) => {
    setLinks(e.target.value.split(',').map(link => link.trim()));
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleLanguageChange = (rowIndex, cellIndex, language) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], language };
    setRows(newRows);
  };

  const handleHeaderChange = (rowIndex, cellIndex, textHeader) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], textHeader};
    setRows(newRows);
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
        <p className={styles.subtitle}>Create a new project for your portfolio, edit an existing one or upload PDF to autofill text content</p>
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
        <h1 className={styles.subTitle}> Project Canvas: </h1>
        <div className={styles.rowsContainer}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, cellIndex) => (
                <ProjectCell
                key={cellIndex}
                cell={cell}
                rowIndex={rowIndex}
                cellIndex={cellIndex}
                handleCellTypeChange={handleCellTypeChange}
                handleCellValueChange={handleCellValueChange}
                handleFileChange={(rowIndex, cellIndex, file) => handleFileChange(rowIndex, cellIndex, file, handleCellValueChange)}
                handleLanguageChange={handleLanguageChange}
                handleHeaderChange={handleHeaderChange}
                handleRemoveCell={handleRemoveCell}
                handleMoveClick={handleMoveClick}
                isValidURL={isValidURL}
              />
              ))}
              {row.length < 2 && (
                <button className={styles.addContentRightButton} onClick={() => handleAddCell(rowIndex)}>
                  <FaPlus />
                </button>
              )}
            </div>
          ))}
        </div>
        <button className={styles.addContentBelowButton} onClick={handleAddRow}> <FaPlus className={styles.iconSpacing}/> Add Content Row </button>
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
          <button className={styles.saveButton} onClick={handleSave}><FaSave className={styles.iconSpacing}/> Save Project</button>
          {initialProjectData._id && (
            <button className={styles.deleteButton} onClick={handleDeleteClick}><FaTrash className={styles.iconSpacing}/> Delete Project</button>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>All deletions are permanent. Are you sure you want to delete?</h2>
            <div className={styles.modalActions}>
              <button className={styles.modalDeleteButton} onClick={handleDelete}>Delete Project</button>
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
          rows={rows}
        />
      )}
    </div>
  );
};

export default AddProject;