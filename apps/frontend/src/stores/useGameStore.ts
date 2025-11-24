import { create } from 'zustand';
import { Keypair } from '@solana/web3.js';

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
  
  // One big action to sync everything frame-by-frame
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

  // Sync Action
  setGameStats: (stats) => set((state) => ({ ...state, ...stats })),

  // Default 0
  banishedCount: 0,
  incrementBanished: () => set((state) => ({ banishedCount: state.banishedCount + 1 })),
}));