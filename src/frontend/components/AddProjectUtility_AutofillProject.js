


// AutofillProjectFromPDF.js
import React from 'react';
import { IoSparkles } from "react-icons/io5";
import pdfToText from 'react-pdftotext';
import config from '../config';
import styles from './AddBlocPortfolio.module.css';

const AutofillProjectFromPDF = ({ setProjectName, setProjectDescription, setTags, setLinks, setRows, setIsLoading }) => {
  async function handleFileSugUpload(text) {
    try {
      setIsLoading(true);
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
      console.log('AutofillProjectFromPDF here data from response: ', data)

      try {
        const parsedData = data;
        const parsedSummary = parsedData.surrounding_summary;
        const parsedSuggestedLayers = parsedData.summary_content;
        console.log('AutofillProjectFromPDF here parsedSuggestedLayers: ', parsedSuggestedLayers)
        return { summary: parsedSummary, layers: parsedSuggestedLayers };
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        console.log('Raw response data:', data);

        return { summary: {}, layers: [] };
      }
    } catch (error) {
      console.error('Failed to extract text from pdf', error);
      // Return a minimal valid object to allow the process to continue
      return { summary: {}, layers: [] };
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  }

  async function extractImagesFromPDF(file) {
    const pdfBytes = await file.arrayBuffer();
    const pdfUint8Array = new Uint8Array(pdfBytes);
    const images = [];
    const maxImagesToExtract = 100;
    const chunkSize = 1024 * 1024; // 1MB chunks
  
    const jpegSignature = [0xFF, 0xD8];
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  
    for (let offset = 0; offset < pdfUint8Array.length && images.length < maxImagesToExtract; offset += chunkSize) {
      const chunk = pdfUint8Array.subarray(offset, offset + chunkSize);
      
      for (let i = 0; i < chunk.length; i++) {
        if (images.length >= maxImagesToExtract) break;
  
        if (chunk[i] === jpegSignature[0] && chunk[i + 1] === jpegSignature[1]) {
          const imageData = extractJPEG(pdfUint8Array, offset + i);
          if (imageData) {
            const dataUrl = `data:image/jpeg;base64,${arrayBufferToBase64(imageData)}`;
            if (await isValidImage(dataUrl)) {
              images.push(dataUrl);
            }
            i += imageData.length - 1;
          }
        } else if (chunk[i] === pngSignature[0] && arrayStartsWith(chunk.subarray(i), pngSignature)) {
          const imageData = extractPNG(pdfUint8Array, offset + i);
          if (imageData) {
            const dataUrl = `data:image/png;base64,${arrayBufferToBase64(imageData)}`;
            if (await isValidImage(dataUrl)) {
              images.push(dataUrl);
            }
            i += imageData.length - 1;
          }
        }
      }
    }
  
    console.log(`Total valid images extracted: ${images.length}`);
    return images;
  }
  
  function arrayStartsWith(array, start) {
    return start.every((value, index) => array[index] === value);
  }
  
  function extractJPEG(data, start) {
    let end = start + 2;
    while (end < data.length - 1) {
      if (data[end] === 0xFF && data[end + 1] === 0xD9) {
        return data.slice(start, end + 2);
      }
      end++;
    }
    return null;
  }
  
  function extractPNG(data, start) {
    let end = start + 8;
    while (end < data.length - 7) {
      if (arrayStartsWith(data.subarray(end), [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82])) {
        return data.slice(start, end + 8);
      }
      end++;
    }
    return null;
  }
  
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  function isValidImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  const handleAutofillFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true); // Start loading
      try {
        console.log('Starting PDF processing...');
        console.log('File details:', file.name, file.size, 'bytes');
        
        const text = await pdfToText(file);
        console.log('PDF text extraction complete');
        
        const parsedData = await handleFileSugUpload(text);
        console.log('File upload and parsing complete');
  
        console.log('Starting image extraction...');
        console.time('Image extraction');
        const images = await extractImagesFromPDF(file);
        console.timeEnd('Image extraction');
        console.log(`Image extraction complete. Found ${images.length} valid images.`);
  
        // Use default values if parsedData properties are undefined
        const projectName = parsedData?.summary?.name || 'Untitled Project';
        const projectDescription = parsedData?.summary?.description || '';
        const tags = parsedData?.summary?.tags || [];
        const links = parsedData?.summary?.links || [];
        const layers = parsedData?.layers || [];
  
        setProjectName(projectName);
        setProjectDescription(projectDescription);
        setTags(tags);
        setLinks(links);
        setRows(structureLayers(layers, images));
        console.log('Project data set successfully');
      } catch (error) {
        console.error('Error processing PDF:', error);
        console.error('Error stack:', error.stack);
        alert('There was an error processing the PDF. Some data may be incomplete.');
      } finally {
        setIsLoading(false); // End loading regardless of success or failure
      }
    }
  };
  
  const structureLayers = (paragraphs, images) => {
    const rows = [];
    let currentRow = [];
    let imageIndex = 0;
  
    paragraphs.forEach((paragraph, index) => {
      const header = Object.keys(paragraph)[0];
      const content = paragraph[header]
      currentRow.push({ type: 'text', value: content, textHeader: header });
      if (imageIndex < images.length) {
        currentRow.push({ type: 'image', value: images[imageIndex] });
        imageIndex++;
      }
      if (currentRow.length === 2 || index === paragraphs.length - 1) {
        rows.push(currentRow);
        currentRow = [];
      }
    });
    console.log('ADDPROJECTUTILITY_AUTOFILLPROJECT.JS here is rows: ', rows)
    return rows;
  };

  return (
    <div className={styles.headerButtons}>
      <label htmlFor="autofillInput" className={styles.autofillLabel}>
        <IoSparkles /> Autofill Project from PDF
      </label>
      <input 
        type="file" 
        id="autofillInput"
        className={styles.autofillInput} 
        onChange={handleAutofillFileChange} 
        accept=".pdf"
      />
    </div>
  );
};

export default AutofillProjectFromPDF;



