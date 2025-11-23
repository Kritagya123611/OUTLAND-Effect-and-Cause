import { create } from 'zustand';
import { Keypair } from '@solana/web3.js';

interface GameState {
  // Session Wallet
  sessionKey: Keypair | null;
  setSessionKey: (key: Keypair) => void;
  
  // Game Progression
  hasRocketLauncher: boolean;
  ammoBalance: number;
  unlockRocketLauncher: () => void;
  addAmmo: (amount: number) => void;

  // Wager State
  wagerActive: boolean;
  setWagerActive: (status: boolean) => void;

  // --- NEW: SCORE STATE ---
  score: number;
  increaseScore: (amount: number) => void;
  resetScore: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  sessionKey: null,
  setSessionKey: (key) => set({ sessionKey: key }),

  hasRocketLauncher: false,
  ammoBalance: 0,
  unlockRocketLauncher: () => set({ hasRocketLauncher: true }),
  addAmmo: (amount) => set((state) => ({ ammoBalance: state.ammoBalance + amount })),

  wagerActive: false,
  setWagerActive: (status) => set({ wagerActive: status }),

  // --- NEW: SCORE LOGIC ---
  score: 0,
  increaseScore: (amount) => set((state) => ({ score: state.score + amount })),
  resetScore: () => set({ score: 0 }),
}));