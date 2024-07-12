import React, { useState, useEffect } from 'react';

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const ANIMATION_INTERVAL = 50; // milliseconds

const LoadingIndicator = () => {
  const [activeCells, setActiveCells] = useState(new Set());

  useEffect(() => {
    let cellCount = 0;
    const intervalId = setInterval(() => {
      if (cellCount >= TOTAL_CELLS) {
        clearInterval(intervalId);
        return;
      }

      setActiveCells(prevCells => {
        const newCells = new Set(prevCells);
        while (newCells.size < cellCount + 1) {
          newCells.add(Math.floor(Math.random() * TOTAL_CELLS));
        }
        return newCells;
      });

      cellCount++;
    }, ANIMATION_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div 
      className="grid gap-1"
      style={{ 
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        width: `${GRID_SIZE * 20}px`,
        height: `${GRID_SIZE * 20}px`
      }}
    >
      {[...Array(TOTAL_CELLS)].map((_, index) => (
        <div
          key={index}
          className={`w-full h-full flex items-center justify-center`}
        >
          <div 
            className={`w-3 h-3 rounded-sm transition-colors duration-300 ${
              activeCells.has(index) ? 'bg-blue-200' : 'bg-gray-800'
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default LoadingIndicator;