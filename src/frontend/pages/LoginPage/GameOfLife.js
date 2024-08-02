import React, { useEffect, useRef, useState } from 'react';

const GameOfLife = () => {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resolution = 10;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const COLS = Math.floor(canvas.width / resolution);
    const ROWS = Math.floor(canvas.height / resolution);

    const MAX_OPACITY = 1;
    const MIN_OPACITY = 0.1;
    const FADE_SPEED = 0.7;

    if (!gridRef.current) {
      gridRef.current = buildGrid(COLS, ROWS);
    }

    function buildGrid(cols, rows) {
      const grid = new Array(cols).fill(null)
        .map(() => new Array(rows).fill(null)
          .map(() => ({ alive: false, opacity: MIN_OPACITY, mouseGenerated: false })));

      // Add interesting patterns at random locations
      addRandomPattern(grid, addGlider, 3);
      addRandomPattern(grid, addPulsar, 2);
      addRandomPattern(grid, addGosperGliderGun, 1);

      // Add some random cells
      addRandomCells(grid, 0.12); // 1% of cells will be randomly alive

      return grid;
    }

    function addRandomPattern(grid, patternFunction, count) {
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * (COLS - 20));
        const y = Math.floor(Math.random() * (ROWS - 20));
        patternFunction(grid, x, y);
      }
    }

    function addRandomCells(grid, probability) {
      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          if (Math.random() < probability) {
            grid[col][row] = { alive: true, opacity: MAX_OPACITY, mouseGenerated: false };
          }
        }
      }
    }

    function addGlider(grid, x, y) {
      const glider = [[0, 1, 0], [0, 0, 1], [1, 1, 1]];
      addPattern(grid, glider, x, y);
    }

    function addPulsar(grid, x, y) {
      const pulsar = [
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
      ];
      addPattern(grid, pulsar, x, y);
    }

    function addGosperGliderGun(grid, x, y) {
      const gosperGliderGun = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      addPattern(grid, gosperGliderGun, x, y);
    }

    function addPattern(grid, pattern, x, y) {
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          if (x + i < COLS && y + j < ROWS) {
            grid[x + i][y + j] = { 
              alive: pattern[i][j] === 1, 
              opacity: pattern[i][j] === 1 ? MAX_OPACITY : MIN_OPACITY, 
              mouseGenerated: false 
            };
          }
        }
      }
    }

    function nextGen(grid) {
      const nextGen = grid.map(arr => [...arr]);

      for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const cell = grid[col][row];
          let numNeighbors = 0;
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              if (i === 0 && j === 0) continue;
              const x_cell = col + i;
              const y_cell = row + j;
              if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
                numNeighbors += grid[x_cell][y_cell].alive ? 1 : 0;
              }
            }
          }

          if (cell.alive && (numNeighbors < 2 || numNeighbors > 3)) {
            nextGen[col][row] = { alive: false, opacity: cell.opacity, mouseGenerated: cell.mouseGenerated };
          } else if (!cell.alive && numNeighbors === 3) {
            nextGen[col][row] = { alive: true, opacity: cell.opacity, mouseGenerated: cell.mouseGenerated };
          } else {
            nextGen[col][row] = { ...cell };
          }

          // Apply fading effect
          if (nextGen[col][row].alive && nextGen[col][row].opacity < MAX_OPACITY) {
            nextGen[col][row].opacity = Math.min(nextGen[col][row].opacity + FADE_SPEED, MAX_OPACITY);
          } else if (!nextGen[col][row].alive && nextGen[col][row].opacity > MIN_OPACITY) {
            nextGen[col][row].opacity = Math.max(nextGen[col][row].opacity - FADE_SPEED, MIN_OPACITY);
          }
        }
      }
      return nextGen;
    }

    function render(grid) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(15, 15, 15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const cell = grid[col][row];
          ctx.beginPath();
          ctx.rect(col * resolution, row * resolution, resolution, resolution);
          if (cell.mouseGenerated) {
            ctx.strokeStyle = `rgba(185, 217, 235, ${cell.opacity})`; // LightSkyBlue color for mouse-generated cells
          } else {
            ctx.strokeStyle = `rgba(185, 217, 235, ${cell.opacity})`;
          }
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function update() {
      gridRef.current = nextGen(gridRef.current);
      render(gridRef.current);
    }

    function spawnCellsAroundMouse(x, y) {
      const col = Math.floor(x / resolution);
      const row = Math.floor(y / resolution);
      const radius = 2;

      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          const newCol = col + i;
          const newRow = row + j;
          if (
            newCol >= 0 && newCol < COLS &&
            newRow >= 0 && newRow < ROWS &&
            Math.random() > 0.7
          ) {
            gridRef.current[newCol][newRow] = { alive: true, opacity: MAX_OPACITY, mouseGenerated: true };
          }
        }
      }
    }

    function handleMouseMove(event) {
      spawnCellsAroundMouse(event.clientX, event.clientY);
    }

    canvas.addEventListener('mousemove', handleMouseMove);

    render(gridRef.current);
    const intervalId = setInterval(update, 100);

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(intervalId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [dimensions]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default GameOfLife;