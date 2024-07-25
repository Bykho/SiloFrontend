import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from './addProject.module.css';

const MoveModal = ({ selectedCell, handleMove, setSelectedCell, rows }) => {
  return (
    <div className={styles.moveModal}>
      <button onClick={() => handleMove('up')} disabled={selectedCell.rowIndex === 0}><FaArrowUp /></button>
      <button onClick={() => handleMove('left')} disabled={selectedCell.cellIndex === 0}><FaArrowLeft /></button>
      <button onClick={() => handleMove('right')} disabled={selectedCell.cellIndex === rows[selectedCell.rowIndex].length - 1}><FaArrowRight /></button>
      <button onClick={() => handleMove('down')} disabled={selectedCell.rowIndex === rows.length - 1}><FaArrowDown /></button>
      <button onClick={() => setSelectedCell(null)}>Cancel</button>
    </div>
  );
};

export default MoveModal;