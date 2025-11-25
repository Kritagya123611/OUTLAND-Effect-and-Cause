import { create } from 'zustand';
import { Keypair } from '@solana/web3.js';

// Define the Kill type
type Kill = {
  id: string; // Transaction Hash
};

interface GameState {
  // --- WALLET & WAGER ---
  sessionKey: Keypair | null;
  setSessionKey: (key: Keypair) => void;
  wagerActive: boolean;
  setWagerActive: (status: boolean) => void;

  // --- PROGRESSION ---
  hasRocketLauncher: boolean;
  ammoBalance: number;
  unlockRocketLauncher: () => void;
  addAmmo: (amount: number) => void;

  // --- GAMEPLAY STATE (The missing part!) ---
  score: number;
  increaseScore: (amount: number) => void;
  
  // Live Data from Phaser
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  weaponName: string;
  isReloading: boolean;
  grenades: number;
  glitchIntensity: number;
  kills: Kill[];
  
  // One big action to sync everything frame-by-frame
  addKill: () => void;
  setGameStats: (stats: Partial<GameState>) => void;
  // --- NEW: BANISHMENT STATE ---
  banishedCount: number;
  incrementBanished: () => void;
  
}

export const useGameStore = create<GameState>((set) => ({
  // Wallet defaults
  sessionKey: null,
  setSessionKey: (key) => set({ sessionKey: key }),
  wagerActive: false,
  setWagerActive: (status) => set({ wagerActive: status }),

  // Progression defaults
  hasRocketLauncher: false,
  ammoBalance: 0,
  unlockRocketLauncher: () => set({ hasRocketLauncher: true }),
  addAmmo: (amount) => set((state) => ({ ammoBalance: state.ammoBalance + amount })),

  // Score defaults
  score: 0,
  increaseScore: (amount) => set((state) => ({ score: state.score + amount })),

  // Gameplay defaults (Fixes NaN bug)
  health: 100,
  maxHealth: 100,
  ammo: 12,
  maxAmmo: 12,
  weaponName: 'PISTOL',
  isReloading: false,
  grenades: 3,
  glitchIntensity: 0,
  kills: [],
  // THE ACTION TO CALL WHEN ENEMY DIES
  addKill: () => {
    const newKill = { id: Math.random().toString(36).substring(7) }; // Fake Hash
    
    set((state) => ({
      score: state.score + 100, // Add score
      kills: [...state.kills, newKill] // Add to feed
    }));

    // Auto-remove the notification after 4 seconds to keep the screen clean
    setTimeout(() => {
      set((state) => ({
        kills: state.kills.filter((k) => k.id !== newKill.id)
      }));
    }, 4000);
  },

  // Sync Action
  setGameStats: (stats) => set((state) => ({ ...state, ...stats })),

  // Default 0
  banishedCount: 0,
  incrementBanished: () => set((state) => ({ banishedCount: state.banishedCount + 1 })),
}));