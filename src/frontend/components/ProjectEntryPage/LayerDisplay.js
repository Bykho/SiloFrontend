import React, { useState, useEffect, useRef } from 'react';
import AddBlocPortfolio from '../AddBlocPortfolio';
import styles from './layerDisplay.module.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs.css';

const LayerDisplay = ({ layers, isEditing, toggleEdit, updateLayer, updateProjectDetails, initialProjectData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const codeContentRefs = useRef({});

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
    console.log('Here is the updatedLayers in handleSave, ', updatedLayers);
    console.log('Here is the updatedProjectDetails in handleSave, ', updatedProjectDetails);
    setShowEditor(false);
    toggleEdit();
    updateLayer(updatedLayers);
    updateProjectDetails(updatedProjectDetails);
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

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const renderVideo = (videoSrc) => {
    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoSrc);
    
    if (youtubeEmbedUrl) {
      return (
        <iframe
          width="100%"
          height="315"
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.video}
        ></iframe>
      );
    } else {
      return (
        <video controls className={styles.video}>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

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
            <AddBlocPortfolio initialRows={layers} initialProjectData={initialProjectData} onSave={handleSave} onClose={handleClose} />
            <button className={styles.closeButton} onClick={() => setShowEditor(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerDisplay;