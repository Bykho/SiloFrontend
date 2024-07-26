import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import config from '../config';
import pdfToText from 'react-pdftotext';
import styles from './fileAutofill.module.css'; // Ensure this file exists for the spinner
import AutofillProjectFromPDF from './AddProjectUtility_AutofillProject';

const FileAutoFill = ({ file, onClose }) => {
  const { user } = useUser();
  const [rows, setRows] = useState([[{ type: '', value: '' }]]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [needsReorganization, setNeedsReorganization] = useState(true);
  const [postponeSave, setPostponeSave] = useState(true); // Add postponeSave state

  useEffect(() => {
    const handleFileAutofill = async () => {
      console.log("handleFileAutofill called");
      try {
        setIsLoading(true);

        const text = await pdfToText(file);
        const parsedData = await handleFileSugUpload(text);

        setProjectName(parsedData?.summary?.name || 'Untitled Project');
        setProjectDescription(parsedData?.summary?.description || '');
        setTags(parsedData?.summary?.tags || []);
        setLinks(parsedData?.summary?.links || []);
        const parsedLayers = parsedData?.layers || [];
        const formattedRows = formatLayersToRows(parsedLayers);
        setRows(transformRows(formattedRows)); // Apply the new transformation function here
        setNeedsReorganization(false);
        setPostponeSave(false); // Indicate reorganization is complete

      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isSaved) {
      handleFileAutofill();
    }
  }, [file, onClose, user.username, isSaved]);

  useEffect(() => {
    if (!isLoading && !needsReorganization && !postponeSave) {
      // Save project after all operations are finished
      handleSave({
        projectName: projectName || 'Untitled Project',
        projectDescription: projectDescription || '',
        layers: rows ? rows : [[]],
        tags: tags || [],
        links: links || [],
        username: user.username
      });
    }
  }, [isLoading, needsReorganization, postponeSave]);

  useEffect(() => {
    console.log('Rows updated:', rows);
  }, [rows]);

  const handleFileSugUpload = async (text) => {
    console.log("handleFileSugUpload called");
    try {
      const response = await fetch(`${config.apiBaseUrl}/projectFileParser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileText: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedData = data;
      const parsedSummary = parsedData.surrounding_summary;
      const parsedSuggestedLayers = parsedData.summary_content;
      console.log("FILEAUTOFILL here is parsedSummary: ", parsedSummary);
      console.log("FILEAUTOFILL here is parsedSuggestedLayers: ", parsedSuggestedLayers);
      return { summary: parsedSummary, layers: parsedSuggestedLayers };
    } catch (error) {
      console.error('Failed to extract text from pdf', error);
      return { summary: {}, layers: [] };
    }
  };

  const formatLayersToRows = (layers) => {
    const rows = [];
    let currentRow = [];

    layers.forEach(layer => {
      if (currentRow.length < 2) {
        currentRow.push(layer);
      } else {
        rows.push(currentRow);
        currentRow = [layer];
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const transformRows = (formattedRows) => {
    return formattedRows.map(row => row.map(cell => {
      let type;
      if (cell.type) {
        type = cell.type;
      } else if (typeof cell.content === 'string' && cell.content.startsWith('data:image')) {
        type = 'image';
      } else if (typeof cell.content === 'string' && cell.content.startsWith('data:video')) {
        type = 'video';
      } else if (typeof cell.content === 'string' && cell.content.startsWith('data:application/pdf')) {
        type = 'pdf';
      } else if (typeof cell.content === 'string' && cell.content.startsWith('data:')) {
        type = 'file';
      } else if (typeof cell.content === 'string') {
        type = 'text';
      } else {
        type = '';
      }

      return {
        type,
        value: cell.content || ''
      };
    }));
  };

  const handleSave = async (projectData) => {
    console.log("handleSave called with data:", projectData);
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
        console.log("Project saved successfully");
        alert('Project saved successfully');
        setIsSaved(true); // Mark the project as saved
        onClose(savedProject);
      } else {
        console.error('Error saving project:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div className={styles.container}>
      {isLoading && <div className={styles.spinner}></div>}
      <AutofillProjectFromPDF
        setProjectName={setProjectName}
        setProjectDescription={setProjectDescription}
        setTags={setTags}
        setLinks={setLinks}
        setRows={setRows}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};

export default FileAutoFill;
