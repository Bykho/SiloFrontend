import React, { useState, useEffect } from 'react';

const CleanOrbitingRingLoader = () => {
  const [cells, setCells] = useState([]);
  const [message, setMessage] = useState('Initializing...');
  
  const size = 41; // Odd size to ensure a center pixel
  const centerX = Math.floor(size / 2);
  const centerY = Math.floor(size / 2);
  const outerRadius = Math.floor(size / 2) - 1; // Outer radius of the ring
  const innerRadius = outerRadius - 2; // Inner radius, creating a 3-pixel thick ring

  const messages = [
    'Analyzing Data',
    'Processing Information',
    'Calculating Results',
    'Generating Insights',
    'Optimizing Performance'
  ];

  useEffect(() => {
    const initialCells = Array(size).fill().map(() => Array(size).fill(0));
    setCells(initialCells);

    let angle = 0;
    const sweepWidth = Math.PI / 3; // 60 degrees sweep

    const updateInterval = setInterval(() => {
      setCells(prevCells => {
        const newCells = JSON.parse(JSON.stringify(prevCells));
        
        // Apply Game of Life rules and sweeping effect
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const dx = i - centerX;
            const dy = j - centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            const cellAngle = Math.atan2(dy, dx);
            
            const isInRing = distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius;
            const isInSweep = (cellAngle > angle && cellAngle < angle + sweepWidth) || 
                              (cellAngle + 2 * Math.PI > angle && cellAngle + 2 * Math.PI < angle + sweepWidth);

            if (isInRing && isInSweep) {
              const neighbors = [
                (i > 0 && j > 0) ? prevCells[i-1][j-1] : 0,
                (i > 0) ? prevCells[i-1][j] : 0,
                (i > 0 && j < size - 1) ? prevCells[i-1][j+1] : 0,
                (j > 0) ? prevCells[i][j-1] : 0,
                (j < size - 1) ? prevCells[i][j+1] : 0,
                (i < size - 1 && j > 0) ? prevCells[i+1][j-1] : 0,
                (i < size - 1) ? prevCells[i+1][j] : 0,
                (i < size - 1 && j < size - 1) ? prevCells[i+1][j+1] : 0,
              ];
              
              const liveNeighbors = neighbors.filter(Boolean).length;
              
              if (prevCells[i][j] === 1) {
                newCells[i][j] = (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
              } else {
                newCells[i][j] = (liveNeighbors === 3 || Math.random() < 0.3) ? 1 : 0;
              }
            } else {
              newCells[i][j] = 0; // Clear cells outside the ring or sweep
            }
          }
        }

        return newCells;
      });

      // Update sweep position
      angle = (angle + 0.1) % (2 * Math.PI);

      // Change message periodically
      if (Math.random() < 0.01) {
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      }
    }, 50);

    return () => clearInterval(updateInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
      <div className="mb-4 text-blue-400 text-xl font-bold">
        {message}
      </div>
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              aspectRatio: '1 / 1',
              width: '100%',
              height: '100%'
            }}
          >
            {cells.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${cell ? 'bg-blue-400' : 'bg-transparent'}`}
                  style={{
                    transition: 'background-color 0.1s ease',
                    boxShadow: cell ? '0 0 2px #60a5fa, 0 0 3px #3b82f6' : 'none',
                    aspectRatio: '1 / 1',
                    width: '100%',
                    height: '100%'
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanOrbitingRingLoader;