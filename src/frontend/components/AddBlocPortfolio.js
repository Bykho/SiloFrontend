


// AddBlocPortfolio.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './AddBlocPortfolio.module.css';
import config from '../config';
import { FaPlus, FaSave, FaTrash, FaArrowsAlt, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import AddBlocPortfolioPreview from "./AddBlocPortfolioPreview";
import AutofillProjectFromPDF from './AddProjectUtility_AutofillProject';

const AddBlocPortfolio = ({ initialRows = [], initialProjectData = {}, onSave = null, onClose = null }) => {
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
      const reorganizeRows = () => {
        const newRows = [];
        let currentRow = [];

        rows.forEach(row => {
          row.forEach(cell => {
            if (currentRow.length < 2) {
              currentRow.push(cell);
            } else {
              newRows.push(currentRow);
              currentRow = [cell];
            }
          });
          if (currentRow.length > 0) {
            newRows.push(currentRow);
            currentRow = [];
          }
        });

        setRows(newRows);
      };

      reorganizeRows();
      setNeedsReorganization(false);
    }
  }, [needsReorganization, rows]);

  const handleAddRow = () => {
    setRows([...rows, [{ type: '', value: '' }]]);
  };

  const handleMoveClick = (rowIndex, cellIndex) => {
    setSelectedCell({ rowIndex, cellIndex });
  };

  const handleMove = (direction) => {
    if (!selectedCell) return;

    const { rowIndex, cellIndex } = selectedCell;
    const newRows = JSON.parse(JSON.stringify(rows)); // Deep copy of rows

    switch (direction) {
      case 'up':
        if (rowIndex > 0) {
          const targetCellIndex = Math.min(cellIndex, newRows[rowIndex - 1].length - 1);
          const temp = newRows[rowIndex][cellIndex];
          newRows[rowIndex][cellIndex] = newRows[rowIndex - 1][targetCellIndex];
          newRows[rowIndex - 1][targetCellIndex] = temp;
        }
        break;
      case 'down':
        if (rowIndex < newRows.length - 1) {
          const targetCellIndex = Math.min(cellIndex, newRows[rowIndex + 1].length - 1);
          const temp = newRows[rowIndex][cellIndex];
          newRows[rowIndex][cellIndex] = newRows[rowIndex + 1][targetCellIndex];
          newRows[rowIndex + 1][targetCellIndex] = temp;
        }
        break;
      case 'left':
        if (cellIndex > 0) {
          const temp = newRows[rowIndex][cellIndex];
          newRows[rowIndex][cellIndex] = newRows[rowIndex][cellIndex - 1];
          newRows[rowIndex][cellIndex - 1] = temp;
        }
        break;
      case 'right':
        if (cellIndex < newRows[rowIndex].length - 1) {
          const temp = newRows[rowIndex][cellIndex];
          newRows[rowIndex][cellIndex] = newRows[rowIndex][cellIndex + 1];
          newRows[rowIndex][cellIndex + 1] = temp;
        }
        break;
      default:
        break;
    }

    const cleanedRows = newRows.filter(row => row.length > 0);
    setRows(cleanedRows);
    setSelectedCell(null);
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

  const handleSave = async () => {
    const projectData = {
      projectName,
      projectDescription,
      layers: rows ? rows : [[]],
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

  const handleHeaderChange = (rowIndex, cellIndex, textHeader) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], textHeader};
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
        setShowDeleteModal(false);
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
                      className={styles.moveCellButton}
                      onClick={() => handleMoveClick(rowIndex, cellIndex)}
                    >
                      <FaArrowsAlt />
                    </button>
                    <button 
                      className={styles.removeCellButton} 
                      onClick={() => handleRemoveCell(rowIndex, cellIndex)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {cell.type === 'text' && (
                    <>
                      <textarea
                      value={cell.textHeader || ''}
                      onChange={(e) => handleHeaderChange(rowIndex, cellIndex, e.target.value)}
                      placeholder="Enter section title"
                      className={styles.headerTextArea}
                    />
  
                    <textarea
                      value={cell.value || ''}
                      onChange={(e) => handleCellValueChange(rowIndex, cellIndex, e.target.value)}
                      placeholder="Enter section text"
                      className={styles.cellTextArea}
                    />
                 </>
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
        <div className={styles.moveModal}>
          <button onClick={() => handleMove('up')} disabled={selectedCell.rowIndex === 0}><FaArrowUp /></button>
          <button onClick={() => handleMove('left')} disabled={selectedCell.cellIndex === 0}><FaArrowLeft /></button>
          <button onClick={() => handleMove('right')} disabled={selectedCell.cellIndex === rows[selectedCell.rowIndex].length - 1}><FaArrowRight /></button>
          <button onClick={() => handleMove('down')} disabled={selectedCell.rowIndex === rows.length - 1}><FaArrowDown /></button>
          <button onClick={() => setSelectedCell(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AddBlocPortfolio;



