// GameOfLife.js
import React, { useEffect, useRef } from 'react';

const GameOfLife = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resolution = 10;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLS = Math.floor(canvas.width / resolution);
    const ROWS = Math.floor(canvas.height / resolution);

    let grid = buildGrid(COLS, ROWS);

    function buildGrid(cols, rows) {
      return new Array(cols).fill(null)
        .map(() => new Array(rows).fill(null)
          .map(() => Math.floor(Math.random() * 2)));
    }

    function nextGen(grid) {
      const nextGen = grid.map(arr => [...arr]);

      for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const cell = grid[col][row];
          let numNeighbors = 0;
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              if (i === 0 && j === 0) {
                continue;
              }
              const x_cell = col + i;
              const y_cell = row + j;

              if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
                const currentNeighbor = grid[col + i][row + j];
                numNeighbors += currentNeighbor;
              }
            }
          }

          if (cell === 1 && numNeighbors < 2) {
            nextGen[col][row] = 0;
          } else if (cell === 1 && numNeighbors > 3) {
            nextGen[col][row] = 0;
          } else if (cell === 0 && numNeighbors === 3) {
            nextGen[col][row] = 1;
          }
        }
      }
      return nextGen;
    }

    function render(grid) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const cell = grid[col][row];
          ctx.beginPath();
          ctx.rect(col * resolution, row * resolution, resolution, resolution);
          if (cell) {
            ctx.strokeStyle = '#B9D9EB';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function update() {
      grid = nextGen(grid);
      render(grid);
    }

    render(grid);
    const intervalId = setInterval(update, 100);

    return () => clearInterval(intervalId);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }} />;
};

export default GameOfLife;
