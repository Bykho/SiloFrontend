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
    'Processing Information',
    'Analyzing Data',
    'Inference',
    'Structuring Response',
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

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a202c',
    padding: '1rem',
  };

  const messageStyle = {
    marginBottom: '1rem',
    color: '#60a5fa',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  };

  const gridContainerStyle = {
    position: 'relative',
    width: '16rem',
    height: '16rem',
  };

  const gridStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 1fr)`,
  };

  const cellStyle = (isActive) => ({
    backgroundColor: isActive ? '#60a5fa' : 'transparent',
    transition: 'background-color 0.1s ease',
    boxShadow: isActive ? '0 0 2px #60a5fa, 0 0 3px #3b82f6' : 'none',
  });

  return (
    <div style={containerStyle}>
      <div style={messageStyle}>{message}</div>
      <div style={gridContainerStyle}>
        <div style={gridStyle}>
          {cells.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                style={cellStyle(cell === 1)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanOrbitingRingLoader;