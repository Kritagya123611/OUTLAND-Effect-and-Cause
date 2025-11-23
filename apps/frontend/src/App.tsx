import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from "./components/GameCanvas";
import GameHUD from "./components/GameHUD";
import DarkGame from "./components/DarkGameCanvas";

export default function App() {
  const [currentWorld, setCurrentWorld] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState(0);
  
  // We use a Ref to track holding state instantly without triggering re-renders
  const isHoldingRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // 1. KEYBOARD LISTENERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Prevent Phaser from blocking this if it tries to
        // e.stopPropagation(); 
        
        if (!isHoldingRef.current) {
          isHoldingRef.current = true;
          startTimeRef.current = Date.now();
          // Start the loop
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isHoldingRef.current = false;
        setProgress(0);
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // Empty dependency array = listeners bind ONLY ONCE

  // 2. ANIMATION LOOP
  const updateProgress = () => {
    if (!isHoldingRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min((elapsed / 2000) * 100, 100); // 2000ms = 2 seconds
    
    setProgress(newProgress);

    if (newProgress >= 100) {
      // TRIGGER SWITCH
      isHoldingRef.current = false; // Force stop holding
      setProgress(0);
      switchWorld(); // Call the switch function
    } else {
      // Keep looping
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // 3. SWITCH LOGIC (Wrapped to access latest state)
  const switchWorld = () => {
    console.log("SWITCHING REALITY...");
    setCurrentWorld(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* Render World A */}
      {currentWorld === 'light' && (
        <div className="absolute inset-0 z-0">
           <GameCanvas />
        </div>
      )}

      {/* Render World B */}
      {currentWorld === 'dark' && (
        <div className="absolute inset-0 z-0">
           <DarkGame />
        </div>
      )}
      
      {/* HUD Layer (Always on top) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameHUD />
      </div>

      {/* Teleport Progress Bar UI */}
      {progress > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 pointer-events-none z-50">
          <div className="text-center mb-2 font-bold text-cyan-400 tracking-widest text-sm animate-pulse">
            SYNCHRONIZING REALITY... {(progress).toFixed(0)}%
          </div>
          
          <div className="h-4 w-full bg-gray-900 border-2 border-cyan-600 skew-x-[-20deg]">
            <div 
              className="h-full bg-cyan-400 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* World Indicator */}
      <div className="absolute top-4 right-4 z-50 pointer-events-none">
        <div className={`px-4 py-2 border-l-4 ${currentWorld === 'light' ? 'border-yellow-400 bg-yellow-900/50' : 'border-purple-500 bg-purple-900/50'} text-white font-bold tracking-wider skew-x-[-10deg]`}>
          CURRENT REALITY: <span className={currentWorld === 'light' ? 'text-yellow-400' : 'text-purple-400'}>{currentWorld.toUpperCase()}</span>
        </div>
      </div>

    </div>
  );
}