import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from "./components/GameCanvas";
import GameHUD from "./components/GameHUD";
import DarkGame from "./components/DarkGameCanvas";
import WagerModal from "./components/WagerModal";

export default function App() {
  const [currentWorld, setCurrentWorld] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState(0);
  const [showWagerModal, setShowWagerModal] = useState(false);
  
  // --- REFS (The "Live" State) ---
  // We use this Ref to let the animation loop see the REAL world value
  const currentWorldRef = useRef(currentWorld); 
  const isHoldingRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // 1. SYNC REF WITH STATE
  // Whenever React state updates, update the Ref too.
  useEffect(() => {
    currentWorldRef.current = currentWorld;
  }, [currentWorld]);

  // 2. KEYBOARD LISTENERS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        if (!isHoldingRef.current) {
          isHoldingRef.current = true;
          startTimeRef.current = Date.now();
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
  }, []); 

  // 3. ANIMATION LOOP
  const updateProgress = () => {
    if (!isHoldingRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min((elapsed / 2000) * 100, 100); 
    
    setProgress(newProgress);

    if (newProgress >= 100) {
      isHoldingRef.current = false;
      setProgress(0);
      
      // --- FIX IS HERE: Use the Ref, not the State variable ---
      // The Ref always has the latest value even inside this closure
      if (currentWorldRef.current === 'light') {
          // Going to Dark -> Pay Money
          setShowWagerModal(true);
      } else {
          // Going back to Light -> Free
          switchWorld();
      }
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const switchWorld = () => {
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
      
      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameHUD />
      </div>

      {/* Teleport Progress UI */}
      {progress > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 pointer-events-none z-50">
          <div className="text-center mb-2 font-bold text-cyan-400 tracking-widest text-sm animate-pulse">
            {/* FIX: Use State here for rendering text, that's fine */}
            {currentWorld === 'light' ? 'INITIALIZING WAGER...' : 'RETURNING TO SAFETY...'} {(progress).toFixed(0)}%
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

      {/* Wager Modal */}
      {showWagerModal && (
          <WagerModal 
              onConfirm={() => {
                  setShowWagerModal(false);
                  switchWorld(); 
              }}
              onCancel={() => {
                  setShowWagerModal(false); 
              }}
          />
      )}
    </div>
  );
}