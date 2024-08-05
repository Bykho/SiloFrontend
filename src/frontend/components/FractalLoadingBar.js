import React, { useState, useEffect } from 'react';

const CleanOrbitingRingLoader = () => {
  const [cells, setCells] = useState([]);
  const [message, setMessage] = useState('Initializing...');
  
  const size = 41;
  const centerX = Math.floor(size / 2);
  const centerY = Math.floor(size / 2);
  const outerRadius = Math.floor(size / 2) - 1;
  const innerRadius = outerRadius - 2;

  const messages = [
    'Processing Information',
    'Analyzing Data',
    'Inference',
    'Structuring Response',
  ];

  useEffect(() => {
    // ... (previous effect code)
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent p-4">
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