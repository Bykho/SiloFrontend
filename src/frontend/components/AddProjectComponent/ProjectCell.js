import React from 'react';
import { FaTrash, FaArrowsAlt } from 'react-icons/fa';
import styles from './addProject.module.css';

const ProjectCell = ({ 
  cell, 
  rowIndex, 
  cellIndex, 
  handleCellTypeChange, 
  handleCellValueChange, 
  handleFileChange, 
  handleLanguageChange, 
  handleHeaderChange, 
  handleRemoveCell, 
  handleMoveClick, 
  isValidURL 
}) => {

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  return (
    <div className={styles.cell}>
      <div className={styles.cellHeader}>
      <textarea
            value={cell.textHeader || ''}
            onChange={(e) => handleHeaderChange(rowIndex, cellIndex, e.target.value)}
            placeholder="Enter section title"
            className={styles.headerTextArea}
          />
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
            value={cell.value || ''}
            onChange={(e) => handleCellValueChange(rowIndex, cellIndex, e.target.value)}
            placeholder="Enter section text"
            className={styles.cellTextArea}
          />
        </>
      )}
      {cell.type === 'image' && (
        <div className={`${styles.fileUploadContainer} ${isValidURL(cell.value) ? styles.noMargin : ''}`}>
            {!isValidURL(cell.value) && (
            <input
              type="file"
              onChange={(e) => handleFileChange(rowIndex, cellIndex, e.target.files[0])}
              accept="image/*"
              className={styles.fileInput}
            />
          )}
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
            type="text"
            value={cell.value || ''}
            onChange={(e) => handleCellValueChange(rowIndex, cellIndex, e.target.value)}
            placeholder="Enter YouTube URL"
            className={styles.urlInput}
          />
          {cell.value && getYouTubeEmbedUrl(cell.value) && (
            <div className={styles.previewContainer}>
              <iframe
                width="560"
                height="315"
                src={getYouTubeEmbedUrl(cell.value)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.preview}
              ></iframe>
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
            value={cell.language || ''}
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
  );
};

export default ProjectCell;