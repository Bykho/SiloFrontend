



import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from './AddBlocPortfolio.module.css';
import config from '../config';

const AddBlocPortfolio = ({ initialLayers, initialProjectData, onSave }) => {
  const [layers, setLayers] = useState(initialLayers || []);
  const [projectName, setProjectName] = useState(initialProjectData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialProjectData?.projectDescription || '');
  const { user } = useUser();

  useEffect(() => {
    setLayers(initialLayers || []);
    setProjectName(initialProjectData?.projectName || '');
    setProjectDescription(initialProjectData?.projectDescription || '');
  }, [initialLayers, initialProjectData]);

  const handleAddLayer = () => {
    const newLayer = [{ type: '', value: '' }, { type: '', value: '' }, { type: '', value: '' }];
    setLayers([...layers, newLayer]);
  };

  const handleAddColumn = (layerIndex) => {
    const newLayers = layers.map((layer, index) => {
      if (index === layerIndex) {
        const newLayer = [...layer, { type: '', value: '' }];
        return newLayer;
      }
      return layer;
    });
    setLayers(newLayers);
  };

  const handleColumnTypeChange = (layerIndex, columnIndex, type) => {
    const newLayers = layers.map((layer, index) => {
      if (index === layerIndex) {
        const newLayer = [...layer];
        newLayer[columnIndex] = { type, value: '' };
        return newLayer;
      }
      return layer;
    });
    setLayers(newLayers);
  };

  const handleColumnChange = (layerIndex, columnIndex, value) => {
    const newLayers = layers.map((layer, index) => {
      if (index === layerIndex) {
        const newLayer = [...layer];
        newLayer[columnIndex].value = value;
        return newLayer;
      }
      return layer;
    });
    setLayers(newLayers);
  };

  const handleFileChange = (layerIndex, columnIndex, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const binaryString = reader.result;
      handleColumnChange(layerIndex, columnIndex, binaryString);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveColumn = (layerIndex, columnIndex) => {
    const newLayers = layers.map((layer, index) => {
      if (index === layerIndex) {
        return layer.filter((_, colIndex) => colIndex !== columnIndex);
      }
      return layer;
    }).filter(layer => layer.length > 0);
    setLayers(newLayers);
  };

  const handleSave = async () => {
    const data = layers.map(layer => layer.map(column => ({
      type: column.type,
      value: column.value
    })));

    const projectData = {
      projectName,
      projectDescription,
      layers: data,
      username: user.username
    };

    // Add project_id if it exists
    if (initialProjectData?.project_id) {
      projectData.project_id = initialProjectData.project_id;
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
        alert('Project saved successfully');
        onSave(layers, { projectName, projectDescription }); // Pass the updated layers and project details back to the parent component
      } else {
        console.error('Error saving project:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div className={styles.container}>
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
      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className={styles.layer}>
          {layer.map((column, columnIndex) => (
            <div key={columnIndex} className={`${styles.column} ${layer.length === 1 ? styles.fullWidth : layer.length === 2 ? styles.halfWidth : ''}`}>
              {column.type === '' && (
                <div className={styles.addColumn} onClick={() => handleColumnTypeChange(layerIndex, columnIndex, 'select')}>
                  +
                </div>
              )}
              {column.type === 'select' && (
                <select
                  value={column.type}
                  onChange={(e) => handleColumnTypeChange(layerIndex, columnIndex, e.target.value)}
                  className={styles.customSelect}
                >
                  <option value="">Select Type</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="pdf">pdf</option>
                </select>
              )}
              {column.type === 'text' && (
                <textarea
                  value={column.value}
                  onChange={(e) => handleColumnChange(layerIndex, columnIndex, e.target.value)}
                  placeholder="Enter text"
                  className={styles.textArea}
                />
              )}
              {column.type === 'image' && (
                <input
                  type="file"
                  onChange={(e) => handleFileChange(layerIndex, columnIndex, e.target.files[0])}
                  placeholder="Upload image"
                  className={styles.fileInput}
                />
              )}
              {column.type === 'pdf' && (
                <input
                  type="file"
                  onChange={(e) => handleFileChange(layerIndex, columnIndex, e.target.files[0])}
                  placeholder="Upload PDF"
                  className={styles.fileInput}
                />
              )}
              <button className={styles.removeColumnButton} onClick={() => handleRemoveColumn(layerIndex, columnIndex)}>-</button>
            </div>
          ))}
          {layer.length < 3 && (
            <div className={styles.addColumnBack} onClick={() => handleAddColumn(layerIndex)}>
              + Add Column
            </div>
          )}
        </div>
      ))}
      <div className={styles.actionButtons}>
        <button className={styles.addLayerButton} onClick={handleAddLayer}>Add Content Row</button>
        <button className={styles.saveButton} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default AddBlocPortfolio;





