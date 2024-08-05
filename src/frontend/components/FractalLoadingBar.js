import React, { useState, useEffect } from 'react';

const FractalLoadingBar = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Initializing...');
  
  const rows = 20;
  const cols = 150;

  const messages = [
    'Digesting PDF',
    'Inferring Details',
    'Analyzing Images',
    'Writing Content',
    'Finalizing Report'
  ];

  useEffect(() => {
    const emptyMatrix = Array(rows).fill().map(() => Array(cols).fill(0));
    setMatrix(emptyMatrix);

    let messageIndex = 0;

    const growthInterval = setInterval(() => {
      setMatrix(prevMatrix => {
        const newMatrix = JSON.parse(JSON.stringify(prevMatrix));
        
        if (newMatrix[Math.floor(rows/2)][0] === 0) {
          newMatrix[Math.floor(rows/2)][0] = 1;
          return newMatrix;
        }

        const growthCandidates = [];

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (newMatrix[i][j] === 0) {
              const neighbors = [
                i > 0 ? newMatrix[i-1][j] : 0,
                j > 0 ? newMatrix[i][j-1] : 0,
                j < cols - 1 ? newMatrix[i][j+1] : 0,
                i < rows - 1 ? newMatrix[i+1][j] : 0,
              ];
              
              const activeNeighbors = neighbors.filter(n => n === 1).length;
              
              if (activeNeighbors > 0) {
                growthCandidates.push([i, j, activeNeighbors]);
              }
            }
          }
        }

        const maxGrowthColumn = Math.max(...newMatrix.map(row => row.lastIndexOf(1)));

        growthCandidates.forEach(([i, j, activeNeighbors]) => {
          const isLeadingEdge = j > maxGrowthColumn - 5;
          const distanceFromCenter = Math.abs(i - rows / 2) / (rows / 2);
          const isMiddle = distanceFromCenter < 0.3;

          let growthProbability = isLeadingEdge ? 0.4 : 0.1;
          growthProbability += activeNeighbors * 0.05;

          // Symmetric growth
          growthProbability += 0.2 * (1 - distanceFromCenter);

          // Boost middle growth even more
          if (isMiddle) {
            growthProbability += 0.25; // Increased from 0.15
          }

          if (Math.random() < growthProbability) {
            newMatrix[i][j] = 1;
            
            // Enhanced branching for tree-like appearance
            if (Math.random() < (isLeadingEdge ? 0.3 : 0.1)) {
              const branchDirections = [[-1, 0], [1, 0], [0, -1]];
              const branchCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 branches
              for (let b = 0; b < branchCount; b++) {
                const [di, dj] = branchDirections[Math.floor(Math.random() * branchDirections.length)];
                if (i + di >= 0 && i + di < rows && j + dj >= 0 && j + dj < cols) {
                  newMatrix[i + di][j + dj] = 1;
                }
                // Mirror branch for symmetry
                const mirroredI = rows - 1 - i;
                if (mirroredI + di >= 0 && mirroredI + di < rows && j + dj >= 0 && j + dj < cols) {
                  newMatrix[mirroredI + di][j + dj] = 1;
                }
              }
            }
          }
        });

        const progress = newMatrix.flat().filter(cell => cell === 1).length / (rows * cols);
        const newMessageIndex = Math.floor(progress * messages.length);
        if (newMessageIndex > messageIndex && newMessageIndex < messages.length) {
          setMessage(messages[newMessageIndex]);
          messageIndex = newMessageIndex;
        }

        if (newMatrix.some(row => row[cols - 1] === 1)) {
          setLoading(false);
          setMessage('Process Complete!');
          clearInterval(growthInterval);
        }

        return newMatrix;
      });
    }, 50);

    return () => clearInterval(growthInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
      <div className="mb-4 text-blue-400 text-xl font-bold">
        {message}
      </div>
      <div className="w-full max-w-3xl bg-gray-800 rounded-full p-1">
        <div className="grid gap-0 rounded-full overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {matrix.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-1 h-1 ${cell ? 'bg-blue-400' : 'bg-transparent'}`}
                style={{
                  transition: 'background-color 0.2s ease',
                  boxShadow: cell ? '0 0 3px #60a5fa, 0 0 5px #3b82f6' : 'none'
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FractalLoadingBar;