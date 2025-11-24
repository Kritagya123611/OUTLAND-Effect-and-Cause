import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ShoppingCart, Zap } from 'lucide-react';
import ShopModal from './ShopModal'; // <--- 1. IMPORT THIS
import LeaderboardModal from './LeaderboardModal';
import { Trophy } from 'lucide-react'; // Import Trophy icon

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
    //state for leaderboard
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

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
            
            {/* --- WALLET BUTTON (Top Left) --- */}
            {/* Moved to Top Left to match standard Dapp UI patterns, fits better with Shop */}
            <div className="absolute top-6 left-6 pointer-events-auto" style={glitchStyle}>
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

            {/* --- SHOP BUTTON (Left Side, below Wallet) --- */}
            <div className="absolute top-24 left-6 pointer-events-auto" style={glitchStyle}>
                <button 
                    onClick={() => setIsShopOpen(true)}
                    className="group relative bg-black/80 border-2 border-amber-400 p-3 skew-x-[-12deg] hover:bg-amber-400 hover:text-black transition-all duration-200"
                >
                    <div className="skew-x-[12deg] flex items-center gap-2">
                        <ShoppingCart size={20} />
                        <span className="font-black tracking-widest">BLACK MARKET</span>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-300"></div>
                </button>
            </div>

            {/* --- 2. SHOP MODAL RENDERING LOGIC --- */}
            {isShopOpen && (
                <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center">
                    {/* Pass the close handler so the 'X' button works */}
                    <ShopModal onClose={() => setIsShopOpen(false)} />
                </div>
            )}

            {/* Top Right - Score */}
            <div className="absolute top-6 right-6" style={glitchStyle}>
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

            <div className="absolute top-40 right-6 pointer-events-auto" style={glitchStyle}>
    <button 
        onClick={() => setIsLeaderboardOpen(true)}
        className="group relative bg-black/80 border-2 border-purple-500 p-3 skew-x-[12deg] hover:bg-purple-500 hover:text-black transition-all duration-200"
    >
        <div className="skew-x-[-12deg] flex items-center gap-2">
            <span className="font-white tracking-widest text-sm">TOP EARNERS</span>
            <Trophy size={18} />
        </div>
    </button>
</div>

            {/* Bottom Center - Ammo Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={glitchStyle}>
                <div className={`relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-6 skew-x-[-12deg] transition-all duration-75 ${
                    glitchIntensity > 0 ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : ''
                }`}>
                    <div className="skew-x-[12deg] text-center">
                        <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">
                            {weaponName}
                        </div>
                        <div className={`text-6xl font-black tracking-tighter transition-all duration-200 ${
                            glitchIntensity > 0
                                ? 'text-cyan-400'
                                : isReloading 
                                ? 'text-red-500 animate-pulse' 
                                : ammo === 0 
                                ? 'text-red-500' 
                                : 'text-amber-400'
                        }`}>
                            {ammo}
                        </div>
                        <div className="text-sm text-gray-500 font-bold mt-1">
                            / {maxAmmo}
                        </div>
                        {isReloading && (
                            <div className="text-xs text-red-500 font-bold mt-2 uppercase tracking-widest animate-pulse">
                                Reloading...
                            </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Right - Grenades */}
            <div className="absolute bottom-6 right-6" style={glitchStyle}>
                <div className={`relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-4 skew-x-[12deg] transition-all duration-75 ${
                    glitchIntensity > 0 ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : ''
                }`}>
                    <div className="skew-x-[-12deg] text-right">
                        <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">
                            Grenades
                        </div>
                        <div className="text-3xl font-black text-amber-400 tracking-tighter">
                            {grenades}
                        </div>
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400"></div>
                    </div>
                </div>
            </div>

            {isLeaderboardOpen && (
    <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center">
        <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
    </div>
)}

            
        </div>
    );
}