


import React, { useState, useEffect } from 'react';
import AddBlocPortfolio from '../AddBlocPortfolio'; // Import the AddBlocPortfolio component
import styles from './layerDisplay.module.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs.css';


const LayerDisplay = ({ layers, isEditing, toggleEdit, updateLayer, updateProjectDetails, initialProjectData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setShowEditor(true);
    }
    // Apply syntax highlighting to all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [isEditing, layers]);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleSave = (updatedLayers, updatedProjectDetails) => {
    console.log('Here is the updatedLayers in handleSave, ', updatedLayers);
    console.log('Here is the updatedProejctDetails in handleSave, ', updatedProjectDetails);
    setShowEditor(false);
    toggleEdit();
    updateLayer(updatedLayers);
    updateProjectDetails(updatedProjectDetails);
  };

  const handleClose = () => {
    setShowEditor(false);
    toggleEdit();
  };

  return (
    <div className={styles.container}>
      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className={styles.layer}>
          {layer.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              {column.type === 'text' && (
                <div className={styles.text}>{column.value}</div>
              )}
              {column.type === 'image' && (
                <div 
                  className={styles.imageContainer} 
                  onClick={() => handleImageClick(column.value)}
                >
                  <img 
                    src={column.value} 
                    alt={`Project ${layerIndex}-${columnIndex}`} 
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay}>
                    <span className={styles.expandIcon}>🔍</span>
                  </div>
                </div>
              )}
              {column.type === 'pdf' && (
                <div className={styles.pdfContainer}>
                  <embed
                    src={column.value}
                    type="application/pdf"
                    width="100%"
                    height="500px"
                    className={styles.pdf}
                  />
                </div>
              )}
              {column.type === 'video' && (
                <div className={styles.videoContainer}>
                  <video controls className={styles.video}>
                    <source src={column.value} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {column.type === 'code' && (
                <div className={styles.codeContainer}>
                  <pre>
                    <code className={`hljs ${column.language || ''}`}>
                      {column.value}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Expanded view" className={styles.modalImage} />
            <button className={styles.closeButton} onClick={closeModal}>×</button>
          </div>
        </div>
      )}
      {showEditor && (
        <div className={styles.modal} onClick={() => setShowEditor(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <AddBlocPortfolio initialRows={layers} initialProjectData={initialProjectData} onSave={handleSave} onClose={handleClose} />
            <button className={styles.closeButton} onClick={() => setShowEditor(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerDisplay;


