'use client';

import { useEffect, useState, useCallback } from 'react';

const GRID_SIZE = 13;
const CELL_SIZE = 40;
const GAME_SPEED = 150;

type Position = { x: number; y: number };
type Vehicle = { x: number; speed: number; width: number };

export default function FroggerGame() {
  const [frogPos, setFrogPos] = useState<Position>({ x: 6, y: 12 });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[][]>([]);

  // Initialize vehicles
  useEffect(() => {
    const initialVehicles: Vehicle[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      if (row >= 2 && row <= 10 && row !== 6) {
        const numVehicles = Math.floor(Math.random() * 2) + 2;
        const rowVehicles: Vehicle[] = [];
        const speed = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5);
        for (let i = 0; i < numVehicles; i++) {
          rowVehicles.push({
            x: (i * GRID_SIZE) / numVehicles,
            speed,
            width: Math.random() > 0.5 ? 2 : 1,
          });
        }
        initialVehicles[row] = rowVehicles;
      } else {
        initialVehicles[row] = [];
      }
    }
    setVehicles(initialVehicles);
  }, []);

  // Move vehicles
  useEffect(() => {
    if (gameOver || won) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((row) =>
          row.map((vehicle) => {
            let newX = vehicle.x + vehicle.speed * 0.1;
            if (newX > GRID_SIZE + 2) newX = -2;
            if (newX < -2) newX = GRID_SIZE + 2;
            return { ...vehicle, x: newX };
          })
        )
      );
    }, GAME_SPEED);

    return () => clearInterval(interval);
  }, [gameOver, won]);

  // Check collisions
  useEffect(() => {
    if (gameOver || won) return;

    const currentRow = vehicles[frogPos.y];
    if (currentRow) {
      for (const vehicle of currentRow) {
        const vehicleLeft = vehicle.x;
        const vehicleRight = vehicle.x + vehicle.width;
        if (
          frogPos.x >= Math.floor(vehicleLeft) &&
          frogPos.x < Math.ceil(vehicleRight)
        ) {
          setGameOver(true);
          return;
        }
      }
    }

    // Check win condition
    if (frogPos.y === 0) {
      setWon(true);
      setScore((prev) => prev + 100);
    }
  }, [frogPos, vehicles, gameOver, won]);

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || won) return;

      let newPos = { ...frogPos };
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (frogPos.y > 0) newPos.y--;
          break;
        case 'ArrowDown':
        case 's':
          if (frogPos.y < GRID_SIZE - 1) newPos.y++;
          break;
        case 'ArrowLeft':
        case 'a':
          if (frogPos.x > 0) newPos.x--;
          break;
        case 'ArrowRight':
        case 'd':
          if (frogPos.x < GRID_SIZE - 1) newPos.x++;
          break;
        default:
          return;
      }
      e.preventDefault();
      setFrogPos(newPos);
    },
    [frogPos, gameOver, won]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const resetGame = () => {
    setFrogPos({ x: 6, y: 12 });
    setGameOver(false);
    setWon(false);
  };

  const getRowColor = (y: number) => {
    if (y === 0) return 'bg-green-600';
    if (y === 12) return 'bg-green-800';
    if (y === 6) return 'bg-yellow-600';
    return 'bg-gray-700';
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2">FROGGER</h1>
          <p className="text-xl">Score: {score}</p>
          <p className="text-sm text-gray-400 mt-2">Use Arrow Keys or WASD to move</p>
        </div>

        <div
          className="relative border-4 border-white"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Grid */}
          {Array.from({ length: GRID_SIZE }).map((_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: GRID_SIZE }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`${getRowColor(y)} border border-gray-800`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                />
              ))}
            </div>
          ))}

          {/* Vehicles */}
          {vehicles.map((row, y) =>
            row.map((vehicle, i) => (
              <div
                key={`${y}-${i}`}
                className="absolute bg-red-600 rounded"
                style={{
                  left: vehicle.x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: vehicle.width * CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            ))
          )}

          {/* Frog */}
          <div
            className="absolute bg-green-400 rounded-full flex items-center justify-center text-2xl transition-all duration-100"
            style={{
              left: frogPos.x * CELL_SIZE,
              top: frogPos.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            🐸
          </div>

          {/* Game Over Overlay */}
          {(gameOver || won) && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">
                  {won ? '🎉 YOU WIN! 🎉' : '💀 GAME OVER 💀'}
                </h2>
                <p className="text-2xl mb-6">Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

