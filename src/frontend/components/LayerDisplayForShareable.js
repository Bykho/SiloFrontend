
import React, { useState, useEffect } from 'react';
import styles from './ProjectEntryPage/layerDisplay.module.css';

const LayerDisplay = ({ layers }) => {
  const [selectedImage, setSelectedImage] = useState(null);


  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
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
    </div>
  );
};

export default LayerDisplay;