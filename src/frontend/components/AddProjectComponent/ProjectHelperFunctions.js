// ProjectHelperFunctions.js
import config from '../../config';

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const handleSave = async (projectData, token, onSave) => {
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
      alert('Project saved successfully');
      if (onSave) {
        if (projectData._id) {
          onSave(savedProject.layers, savedProject);
        } else {
          onSave(savedProject);
        }
      }
    } else {
      console.error('Error saving project:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving project:', error);
  }
};

export const handleDelete = async (projectId, userId, token, onClose) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/deleteProject`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ projectId, userId }),
    });
    if (response.ok) {
      if (onClose) {
        onClose();
      }
    } else {
      console.error('Error deleting project:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};

export const reorganizeRows = (rows) => {
  const newRows = [];
  let currentRow = [];

  rows.forEach(row => {
    row.forEach(cell => {
      if (currentRow.length < 2) {
        currentRow.push(cell);
      } else {
        newRows.push(currentRow);
        currentRow = [cell];
      }
    });
    if (currentRow.length > 0) {
      newRows.push(currentRow);
      currentRow = [];
    }
  });

  return newRows;
};

export const handleMove = (direction, selectedCell, rows) => {
  if (!selectedCell) return rows;

  const { rowIndex, cellIndex } = selectedCell;
  const newRows = JSON.parse(JSON.stringify(rows)); // Deep copy of rows

  switch (direction) {
    case 'up':
      if (rowIndex > 0) {
        const targetCellIndex = Math.min(cellIndex, newRows[rowIndex - 1].length - 1);
        const temp = newRows[rowIndex][cellIndex];
        newRows[rowIndex][cellIndex] = newRows[rowIndex - 1][targetCellIndex];
        newRows[rowIndex - 1][targetCellIndex] = temp;
      }
      break;
    case 'down':
      if (rowIndex < newRows.length - 1) {
        const targetCellIndex = Math.min(cellIndex, newRows[rowIndex + 1].length - 1);
        const temp = newRows[rowIndex][cellIndex];
        newRows[rowIndex][cellIndex] = newRows[rowIndex + 1][targetCellIndex];
        newRows[rowIndex + 1][targetCellIndex] = temp;
      }
      break;
    case 'left':
      if (cellIndex > 0) {
        const temp = newRows[rowIndex][cellIndex];
        newRows[rowIndex][cellIndex] = newRows[rowIndex][cellIndex - 1];
        newRows[rowIndex][cellIndex - 1] = temp;
      }
      break;
    case 'right':
      if (cellIndex < newRows[rowIndex].length - 1) {
        const temp = newRows[rowIndex][cellIndex];
        newRows[rowIndex][cellIndex] = newRows[rowIndex][cellIndex + 1];
        newRows[rowIndex][cellIndex + 1] = temp;
      }
      break;
    default:
      break;
  }

  return newRows.filter(row => row.length > 0);
};