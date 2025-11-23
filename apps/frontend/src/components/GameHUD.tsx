import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ShoppingCart } from 'lucide-react';

export default function GameHUD() {
    const {
        health,
        maxHealth,
        ammo,
        maxAmmo,
        weaponName,
        isReloading,
        grenades,
        score,
        glitchIntensity,
    } = useGameStore();

    // Local state for the Shop
    const [isShopOpen, setIsShopOpen] = useState(false);

    const healthPercent = (health / maxHealth) * 100;
    const healthSegments = 10;
    const filledSegments = Math.floor((healthPercent / 100) * healthSegments);

    // Glitch effect - update on intensity change
    const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, hue: 0 });
    
    useEffect(() => {
        if (glitchIntensity > 0) {
            const interval = setInterval(() => {
                setGlitchOffset({
                    x: (Math.random() * 4 - 2) * glitchIntensity,
                    y: (Math.random() * 4 - 2) * glitchIntensity,
                    hue: (Math.random() * 20 - 10) * glitchIntensity,
                });
            }, 50);
            return () => clearInterval(interval);
        } else {
            setGlitchOffset({ x: 0, y: 0, hue: 0 });
        }
    }, [glitchIntensity]);

    const glitchStyle = glitchIntensity > 0 ? {
        transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
        filter: `hue-rotate(${glitchOffset.hue}deg) brightness(${1 + glitchIntensity * 0.3})`,
        textShadow: `0 0 ${glitchIntensity * 10}px cyan, 0 0 ${glitchIntensity * 20}px cyan`,
    } : {};

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            
            {/* --- NEW: WALLET BUTTON (Top Left) --- */}
            <div className="absolute bottom-6 right-6 pointer-events-auto" style={glitchStyle}>
                <div className="skew-x-[-12deg] border-2 border-amber-500">
                    <WalletMultiButton style={{ 
                        backgroundColor: '#1a1a1a', 
                        color: '#f59e0b', 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        borderRadius: '0'
                    }} />
                </div>
            </div>

            {/* --- NEW: SHOP BUTTON (Left Side) --- */}
            <div className="absolute top-9 left-6 pointer-events-auto" style={glitchStyle}>
                <button 
                    onClick={() => setIsShopOpen(true)}
                    className="relative border-2 border-black bg-amber-400 p-3 skew-x-[-12deg] hover:bg-amber-400"
                >
                    <div className="skew-x-[12deg] flex items-center gap-2">
                        <ShoppingCart size={20} />
                        <span className="font-black tracking-widest">BLACK MARKET</span>
                    </div>
                    {/* Shine effect */}
                    
                </button>
            </div>

            {/* --- SHOP MODAL (Rendered here so it sits on top) --- */}
            {/* Top Right - Score */}
            <div className="absolute top-6 right-6 mt-12" style={glitchStyle}>
                <div className={`relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-4 skew-x-[12deg] transition-all duration-75 ${
                    glitchIntensity > 0 ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : ''
                }`}>
                    <div className="skew-x-[-12deg] text-right">
                        <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">
                            Score
                        </div>
                        <div className="text-3xl font-black text-amber-400 tracking-tighter">
                            {(score || 0).toLocaleString()}
                        </div>
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Left - Health Bar */}
            <div className="absolute bottom-6 left-6">
                <div className="relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-4 skew-x-[-12deg] min-w-[300px]">
                    <div className="skew-x-[12deg]">
                        <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">
                            Integrity
                        </div>
                        {/* Segmented Health Bar */}
                        <div className="flex gap-1 mb-2">
                            {Array.from({ length: healthSegments }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-4 flex-1 border border-amber-400 transition-all duration-300 ${
                                        i < filledSegments
                                            ? healthPercent > 50
                                                ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                                                : healthPercent > 25
                                                ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
                                                : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                                            : 'bg-black/50'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm font-black text-amber-400 tracking-tighter">
                            {Math.max(0, health)} / {maxHealth}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}