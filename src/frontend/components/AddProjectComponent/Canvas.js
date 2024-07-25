import React from 'react';
import ProjectCell from './ProjectCell';
import styles from './addProject.module.css';
import { LuFileWarning } from "react-icons/lu";

const Canvas = ({ layers, ...props }) => {
  return (
    <div className={styles.canvas}>
      {layers.length === 0 ? (
        <p className={styles.helper}><LuFileWarning /> Please add content</p>
      ) : (
        layers.flat().map((cell, index) => (
          <ProjectCell
            key={index}
            cell={cell}
            rowIndex={Math.floor(index / 2)}
            cellIndex={index % 2}
            {...props}
          />
        ))
      )}
    </div>
  );
};

export default Canvas;