import React, { useState, useEffect, useRef } from 'react';
import AddProject from '../AddProjectComponent/AddProject';
import styles from './layerDisplay.module.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import ReactPlayer from 'react-player';

const LayerDisplay = ({ layers, isEditing, toggleEdit, updateLayer, updateProjectDetails, initialProjectData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const codeContentRefs = useRef({});

  layers = layers ?? [[]];

  useEffect(() => {
    if (isEditing) {
      setShowEditor(true);
    }

    // Apply syntax highlighting to all code blocks
    Object.values(codeContentRefs.current).forEach(ref => {
      if (ref) {
        hljs.highlightElement(ref.querySelector('code'));
      }
    });
  }, [isEditing, layers]);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleSave = (updatedLayers, updatedProjectDetails) => {
    setShowEditor(false);
    toggleEdit();
    if (updatedLayers) {
      updateLayer(updatedLayers);
    }
    if (updatedProjectDetails) {
      updateProjectDetails(updatedProjectDetails);
    }
  };

  const handleClose = () => {
    setShowEditor(false);
    toggleEdit();
  };

  const renderCode = (code, language, index) => {
    const lines = code.split('\n');

    const handleScroll = (e) => {
      const lineNumbers = e.target.querySelector(`.${styles.lineNumbers}`);
      if (lineNumbers) {
        lineNumbers.scrollTop = e.target.scrollTop;
      }
    };

    return (
      <div 
        className={styles.codeContent} 
        onScroll={handleScroll} 
        ref={el => codeContentRefs.current[index] = el}
      >
        <div className={styles.lineNumbers}>
          {lines.map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre className={styles.code}>
          <code className={language || ''}>
            {code}
          </code>
        </pre>
      </div>
    );
  };

  const renderVideo = (videoSrc) => {
    // Use ReactPlayer to handle videos from multiple platforms
    return (
      <ReactPlayer
        url={videoSrc}
        controls
        width="100%"
        height="315px"
        className={styles.video}
      />
    );
  };

  useEffect(() => {
    console.log("here is the layer object: ", layers);
  }, []);

  return (
    <div className={styles.container}>
      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className={styles.layer}>
          {layer.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              {column.type === 'text' && (
                <div className={styles.textContainer}>
                  <div className={styles.textHeader}>{column.textHeader}</div>
                  <div className={styles.text}>{column.value}</div>
                </div>
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
                    <span className={styles.expandIcon}></span>
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
                  {renderVideo(column.value)}
                </div>
              )}
              {column.type === 'code' && (
                <div className={styles.codeContainer}>
                  {renderCode(column.value, column.language, `${layerIndex}-${columnIndex}`)}
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
            <AddProject initialRows={layers} initialProjectData={initialProjectData} onSave={handleSave} onClose={handleClose} />
            <button className={styles.closeButton} onClick={() => setShowEditor(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerDisplay;
