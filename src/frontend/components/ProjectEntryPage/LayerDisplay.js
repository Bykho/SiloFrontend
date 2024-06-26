import React, { useState } from 'react';
import styles from './layerDisplay.module.css';

const LayerDisplay = ({ layers, isEditing, updateLayer }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (e, layerIndex, columnIndex) => {
    const { value, innerText } = e.target;
    updateLayer(layerIndex, columnIndex, value || innerText);
  };

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
                isEditing ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(e, layerIndex, columnIndex)}
                    className={styles.editableText}
                  >
                    {column.value}
                  </div>
                ) : (
                  <div className={styles.text}>{column.value}</div>
                )
              )}
              {column.type === 'image' && (
                isEditing ? (
                  <input
                    type="text"
                    value={column.value}
                    onChange={(e) => handleInputChange({ target: { value: e.target.value } }, layerIndex, columnIndex)}
                    className={styles.editInput}
                    placeholder="Enter image URL"
                  />
                ) : (
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
                )
              )}
              {column.type === 'pdf' && (
                isEditing ? (
                  <input
                    type="text"
                    value={column.value}
                    onChange={(e) => handleInputChange({ target: { value: e.target.value } }, layerIndex, columnIndex)}
                    className={styles.editInput}
                    placeholder="Enter PDF URL"
                  />
                ) : (
                  <div className={styles.pdfContainer}>
                    <embed
                      src={column.value}
                      type="application/pdf"
                      width="100%"
                      height="500px"
                      className={styles.pdf}
                    />
                  </div>
                )
              )}
              {column.type === 'video' && (
                isEditing ? (
                  <input
                    type="text"
                    value={column.value}
                    onChange={(e) => handleInputChange({ target: { value: e.target.value } }, layerIndex, columnIndex)}
                    className={styles.editInput}
                    placeholder="Enter video URL"
                  />
                ) : (
                  <div className={styles.videoContainer}>
                    <video controls className={styles.video}>
                      <source src={column.value} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )
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