import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './AddBlocPortfolio.module.css';
import config from '../config';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import pdfToText from 'react-pdftotext';
import { IoSparkles } from "react-icons/io5";


const AddBlocPortfolio = ({ initialRows = [], initialProjectData = {}, onSave = null, onClose = null }) => {
  console.log('this is initialProjectData._id: ', initialProjectData._id);

  const [rows, setRows] = useState(initialRows.length ? initialRows : [[{ type: '', value: '' }]]);
  const [projectName, setProjectName] = useState(initialProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialProjectData?.projectDescription || '');
  const [tags, setTags] = useState(initialProjectData?.tags || []);
  const [links, setLinks] = useState(initialProjectData?.links || []);
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading ] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [suggestedSummary, setSuggestedSummary] = useState('');

  const handleAddRow = () => {
    setRows([...rows, [{ type: '', value: '' }]]);
  };

  const handleAddCell = (rowIndex) => {
    if (rows[rowIndex].length < 3) {
      const newRows = [...rows];
      newRows[rowIndex] = [...newRows[rowIndex], { type: '', value: '' }];
      setRows(newRows);
    }
  };

  const handleCellTypeChange = (rowIndex, cellIndex, type) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], type, value: '' }; // Reset value on type change
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

  const handleSave = async () => {
    const projectData = {
      projectName,
      projectDescription,
      layers: rows ? rows : [[]],
      tags,
      links,
      username: user.username
    };
    console.log('were trying to saave');
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
        const savedProject = await response.json(); // Assuming your API returns the saved project
        alert('Project saved successfully');
        console.log('here is the savedProject ahead of the onSave call', savedProject)
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

  const handleTagsChange = (e) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
  };

  const handleLinksChange = (e) => {
    setLinks(e.target.value.split(',').map(link => link.trim()));
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleLanguageChange = (rowIndex, cellIndex, language) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], language };
    setRows(newRows);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteProject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId: initialProjectData._id, userId: user._id }),
      });
      if (response.ok) {
        console.log('modal delete project button was clicked.');
        setShowDeleteModal(false);
        if (onClose) {
          onClose(); // Close the AddBlocPortfolio modal
        }
      } else {
        console.error('Error deleting project:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };


  const handleFileSugUpload = async (text) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/projectFileParser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileText: text }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received summary:', data.summary);
        const parsedSummary = JSON.parse(data.summary);
        console.log('Parsed summary:', parsedSummary);
        setSuggestedSummary(parsedSummary);
        return parsedSummary;
      } else {
        console.error('Failed to send extracted text to backend');
      }
    } catch (error) {
      console.error('Failed to extract text from pdf', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result;
        const text = await pdfToText(file);
        const parsedData = await handleFileSugUpload(text);

        if (parsedData) {
          setProjectName(parsedData.name);
          setProjectDescription(parsedData.description);
          setTags(parsedData.tags || []);
          setLinks(parsedData.links || []);
          setRows(parsedData.layers || [[{ type: '', value: '' }]]);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.containerWrapper}>
      {isLoading && <div className={styles.spinner}></div>}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Project Builder</h1>
          <label htmlFor="autofillInput" className={styles.autofillLabel}>
            <IoSparkles /> Autofill Project from PDF
          </label>
          <input 
            type="file" 
            id="autofillInput"
            className={styles.autofillInput} 
            onChange={handleAutofillFileChange} 
            accept=".pdf"
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
        <h1 className={styles.subTitle}> Project Content: </h1>
        <p className={styles.subtitle}> Add up to 3 content blocks per row... </p>
        <div className={styles.rowsContainer}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className={styles.cell}>
                  <div className={styles.cellHeader}>
                    <select
                      value={cell.type}
                      onChange={(e) => handleCellTypeChange(rowIndex, cellIndex, e.target.value)}
                      className={styles.cellTypeSelect}
                    >
                      <option value="">Select Type</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="code">Code</option>
                    </select>
                    <button 
                      className={styles.removeCellButton} 
                      onClick={() => handleRemoveCell(rowIndex, cellIndex)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {cell.type === 'text' && (
                    <textarea
                      value={cell.value || ''}
                      onChange={(e) => handleCellValueChange(rowIndex, cellIndex, e.target.value)}
                      placeholder="Enter text"
                      className={styles.cellTextArea}
                    />
                  )}
                  {cell.type === 'image' && (
                    <div className={styles.fileUploadContainer}>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(rowIndex, cellIndex, e.target.files[0])}
                        accept="image/*"
                        className={styles.fileInput}
                      />
                      {isValidURL(cell.value) && (
                        <div className={styles.previewContainer}>
                          <img src={cell.value} alt="Preview" className={styles.preview} />
                        </div>
                      )}
                    </div>
                  )}
                  {cell.type === 'video' && (
                    <div className={styles.fileUploadContainer}>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(rowIndex, cellIndex, e.target.files[0])}
                        accept="video/*"
                        className={styles.fileInput}
                      />
                      {isValidURL(cell.value) && (
                        <div className={styles.previewContainer}>
                          <video src={cell.value} controls className={styles.preview} />
                        </div>
                      )}
                    </div>
                  )}
                  {cell.type === 'pdf' && (
                    <div className={styles.fileUploadContainer}>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(rowIndex, cellIndex, e.target.files[0])}
                        accept=".pdf"
                        className={styles.fileInput}
                      />
                      {isValidURL(cell.value) && (
                        <div className={styles.previewContainer}>
                          <embed src={cell.value} type="application/pdf" className={styles.preview} />
                        </div>
                      )}
                    </div>
                  )}
                  {cell.type === 'code' && (
                    <>
                      <select
                        value={cell.language}
                        onChange={(e) => handleLanguageChange(rowIndex, cellIndex, e.target.value)}
                        className={styles.languageSelect}
                      >
                        <option value="">Select Language</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="css">CSS</option>
                        <option value="html">HTML</option>
                        <option value="c">C</option>
                        <option value="c++">C++</option>
                        <option value="ruby">Ruby</option>
                        <option value="php">PHP</option>
                        <option value="rust">Rust</option>
                        {/* Add more language options as needed */}
                      </select>
                      <textarea
                        value={cell.value || ''}
                        onChange={(e) => handleCellValueChange(rowIndex, cellIndex, e.target.value)}
                        placeholder="Enter code"
                        className={styles.cellTextArea}
                      />
                    </>
                  )}
                </div>
              ))}
              {row.length < 3 && (
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
    </div>
  );
};

export default AddBlocPortfolio;






