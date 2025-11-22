import { create } from 'zustand';

export interface GameState {
    // Player stats
    health: number;
    maxHealth: number;
    ammo: number;
    maxAmmo: number;
    weaponName: string;
    isReloading: boolean;
    grenades: number;
    score: number;
    
    // World state
    currentWorld: 'A' | 'B';
    
    // Actions
    setHealth: (health: number) => void;
    setAmmo: (ammo: number, maxAmmo: number) => void;
    setWeapon: (name: string) => void;
    setReloading: (isReloading: boolean) => void;
    setGrenades: (count: number) => void;
    setScore: (score: number) => void;
    switchWorld: () => void;
    triggerGlitch: () => void;
    
    // Glitch state
    glitchIntensity: number;
}

export const useGameStore = create<GameState>((set) => ({
    // Initial state
    health: 100,
    maxHealth: 100,
    ammo: 12,
    maxAmmo: 12,
    weaponName: 'Pistol',
    isReloading: false,
    grenades: 3,
    score: 0,
    currentWorld: 'A',
    glitchIntensity: 0,
    
    // Actions
    setHealth: (health) => set({ health }),
    setAmmo: (ammo, maxAmmo) => set({ ammo, maxAmmo }),
    setWeapon: (weaponName) => set({ weaponName }),
    setReloading: (isReloading) => set({ isReloading }),
    setGrenades: (grenades) => set({ grenades }),
    setScore: (score) => set({ score }),
    switchWorld: () => set((state) => ({ 
        currentWorld: state.currentWorld === 'A' ? 'B' : 'A' 
    })),
    triggerGlitch: () => {
        set({ glitchIntensity: 1.0 });
        setTimeout(() => {
            set({ glitchIntensity: 0 });
        }, 200);
    },
}));

