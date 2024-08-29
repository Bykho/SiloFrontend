import React, { useState, useEffect, useRef } from 'react';
import styles from './animatedSiloButton.module.css';

const SiloBetaButton = ({ onClick }) => {
  const rows = 12;
  const cols = 24;
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [heatGrid, setHeatGrid] = useState(() => Array(rows).fill().map(() => Array(cols).fill(0)));
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const buttonRef = useRef();

  function createInitialGrid() {
    const grid = Array(rows).fill().map(() => Array(cols).fill(false));
    const patterns = [
      [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], // glider
      [[3, 13], [3, 16], [4, 12], [5, 12], [6, 12], [6, 15], [5, 16]], // lwss
      [[2, 6], [2, 7], [2, 8], [2, 12], [2, 13], [2, 14],
       [7, 6], [7, 7], [7, 8], [7, 12], [7, 13], [7, 14],
       [9, 6], [9, 7], [9, 8], [9, 12], [9, 13], [9, 14],
       [4, 4], [5, 4], [6, 4], [4, 9], [5, 9], [6, 9], [4, 11], [5, 11], [6, 11], [4, 16], [5, 16], [6, 16]] // pulsar
    ];
    patterns.forEach(pattern => {
      pattern.forEach(([x, y]) => {
        grid[x][y] = true;
      });
    });
    return grid;
  }

  const countNeighbors = (grid, x, y) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newX = (x + i + rows) % rows;
        const newY = (y + j + cols) % cols;
        count += grid[newX][newY] ? 1 : 0;
      }
    }
    return count;
  };

  const updateGrid = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      if (deltaTime > 150) {
        setGrid(g => g.map((row, i) => 
          row.map((cell, j) => {
            const neighbors = countNeighbors(g, i, j);
            const heat = heatGrid[i][j];
            // Modified rules based on heat
            if (cell) {
              return (neighbors === 2 || neighbors === 3) || (heat > 0.5 && neighbors === 1);
            } else {
              return neighbors === 3 || (heat > 0.7 && neighbors === 2);
            }
          })
        ));
        // Decay heat
        setHeatGrid(hg => hg.map(row => row.map(cell => Math.max(0, cell - 0.1))));
        previousTimeRef.current = time;
      }
    } else {
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(updateGrid);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGrid);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / cols));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / rows));
    
    setHeatGrid(hg => {
      const newHg = [...hg];
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const newX = (x + i + cols) % cols;
          const newY = (y + j + rows) % rows;
          const distance = Math.sqrt(i*i + j*j);
          const heatValue = Math.max(0, 1 - distance / 3);
          newHg[newY][newX] = Math.min(1, newHg[newY][newX] + heatValue);
        }
      }
      return newHg;
    });
  };

  return (
    <button 
      className={styles.siloButton} 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHeatGrid(hg => hg.map(row => row.map(() => 0)))}
      ref={buttonRef}
    >
      <div className={styles.gameOfLife}>
        {grid.map((row, i) => (
          <div key={i} className={styles.row}>
            {row.map((cell, j) => (
              <span 
                key={j} 
                className={`${styles.cell} ${cell ? styles.alive : ''}`}
                style={{
                  backgroundColor: `rgba(255, ${255 - heatGrid[i][j] * 255}, ${255 - heatGrid[i][j] * 255}, ${cell ? 0.9 : 0})`,
                  boxShadow: `0 0 ${3 + heatGrid[i][j] * 5}px rgba(255, ${255 - heatGrid[i][j] * 255}, ${255 - heatGrid[i][j] * 255}, ${0.8 + heatGrid[i][j] * 0.2})`
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <span className={styles.buttonText}>
        <span className={styles.letter}>S</span>
        <span className={styles.letter}>i</span>
        <span className={styles.letter}>l</span>
        <span className={styles.letter}>o</span>
        <span className={styles.letter}>_</span>
        <span className={styles.letter}>R</span>
        <span className={styles.letter}>e</span>
        <span className={styles.letter}>p</span>
        <span className={styles.letter}>o</span>
      </span>
    </button>
  );
};

export default SiloBetaButton;