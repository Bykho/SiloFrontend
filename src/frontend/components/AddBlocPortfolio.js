



import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './AddBlocPortfolio.module.css';
import config from '../config';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';

const AddBlocPortfolio = ({ initialRows = [], initialProjectData = {}, onSave = null }) => {
  console.log('this is what the initialProjectData holds: ', initialProjectData);
  console.log('this is what the initialRows holds: ', initialRows);

  const [rows, setRows] = useState(initialRows.length ? initialRows : [[{ type: '', value: '' }]]);
  const [projectName, setProjectName] = useState(initialProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialProjectData?.projectDescription || '');
  const { user } = useUser();

  // useEffect(() => {
  //   setRows(initialRows);
  //   setProjectName(initialProjectData?.projectName || '');
  //   setProjectDescription(initialProjectData?.projectDescription || '');
  // }, [initialRows, initialProjectData]);

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
    newRows[rowIndex][cellIndex] = { ...newRows[rowIndex][cellIndex], type, value: newRows[rowIndex][cellIndex].value || '' };
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
      layers: rows,
      username: user.username
    };

    if (initialProjectData?.project_id) {
      projectData.project_id = initialProjectData.project_id;
    }
    console.log('here is project data, ', projectData)
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
        alert('Project saved successfully');
        if (onSave) {
          onSave(rows, { projectName, projectDescription });
        }
      } else {
        console.error('Error saving project:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Project Builder</h1>
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
                      {cell.value && (
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
                      {cell.value && (
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
                      {cell.value && (
                        <div className={styles.previewContainer}>
                          <embed src={cell.value} type="application/pdf" className={styles.preview} />
                        </div>
                      )}
                    </div>
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
          <input type="text" placeholder="Add tags" className={styles.tagInput} />
          <input type="text" placeholder="Add links" className={styles.linkInput} />
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.saveButton} onClick={handleSave}><FaSave className={styles.iconSpacing}/> Save Project</button>
        </div>
      </div>
    </div>
  );
};

export default AddBlocPortfolio;






