import React, { useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProjectCell from './ProjectCell';
import styles from './addProject.module.css';
import { LuFileWarning } from "react-icons/lu";
import { FaArrowsAlt } from 'react-icons/fa';

const DraggableCell = ({ cell, index, moveCell, isRearranging, ...props }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'cell',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'cell',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCell(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`${styles.draggableItem} ${isDragging ? styles.dragging : ''}`}>
      {isRearranging && <div className={styles.dragHandle}><FaArrowsAlt /></div>}
      <ProjectCell
        cell={cell}
        rowIndex={Math.floor(index / 2)}
        cellIndex={index % 2}
        {...props}
      />
    </div>
  );
};

const Canvas = ({ layers, setRows, isRearranging, ...props }) => {

  const moveCell = useCallback((dragIndex, hoverIndex) => {
    const flatLayers = layers.flat();
    const dragCell = flatLayers[dragIndex];
    const newFlatLayers = [...flatLayers];
    newFlatLayers.splice(dragIndex, 1);
    newFlatLayers.splice(hoverIndex, 0, dragCell);

    const newLayers = [];
    for (let i = 0; i < newFlatLayers.length; i += 2) {
      newLayers.push(newFlatLayers.slice(i, i + 2));
    }

    setRows(newLayers);
  }, [layers, setRows]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.canvas}>
        {layers.length === 0 ? (
          <p className={styles.helper}><LuFileWarning /> Please add content</p>
        ) : (
          layers.flat().map((cell, index) => (
            <DraggableCell
              key={`cell-${index}`}
              index={index}
              cell={cell}
              moveCell={moveCell}
              isRearranging={isRearranging}
              {...props}
            />
          ))
        )}
      </div>
    </DndProvider>
  );
};

export default Canvas;