import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ShoppingCart, Trophy, Zap } from 'lucide-react';
import ShopModal from './ShopModal';
import LeaderboardModal from './LeaderboardModal';
import { MempoolFeed } from './MempoolFeed';

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
        kills,
    } = useGameStore();

    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    const healthPercent = (health / maxHealth) * 100;
    const healthSegments = 10;
    const filledSegments = Math.floor((healthPercent / 100) * healthSegments);

    // Glitch effect logic
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
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden font-mono">
            
            {/* --- SECTION 1: TOP LEFT (Wallet & Shop Stack) --- */}
            <div className="absolute top-6 left-6 flex flex-col items-start gap-3 pointer-events-auto z-50" style={glitchStyle}>
                {/* A. Wallet Connection */}
                <div className="skew-x-[-12deg] border-2 border-amber-500/80 bg-black shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-shadow">
                    <WalletMultiButton style={{ 
                        backgroundColor: '#050505', 
                        color: '#f59e0b', 
                        height: '48px',
                        fontFamily: 'monospace', 
                        fontWeight: '900',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: '0',
                        border: 'none',
                        padding: '0 24px'
                    }} />
                </div>
                
                {/* B. Black Market Button */}
                <button 
                    onClick={() => setIsShopOpen(true)}
                    className="group relative flex items-center gap-3 bg-black/90 border-2 border-amber-500 px-6 py-3 skew-x-[-12deg] transition-all duration-300 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                >
                    <div className="skew-x-[12deg] flex items-center gap-2">
                        <ShoppingCart size={18} className="group-hover:animate-bounce" />
                        <span className="font-black tracking-widest text-sm">BLACK MARKET</span>
                    </div>
                    {/* Hover Shine Animation */}
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out pointer-events-none"></div>
                </button>
            </div>

            {/* --- SECTION 2: TOP CENTER (Leaderboard) --- */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50" style={glitchStyle}>
                <button 
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="group relative px-10 py-2 transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                    {/* Background Layer */}
                    <div className="absolute inset-0 skew-x-[-12deg] border-2 border-purple-500 bg-gradient-to-b from-purple-900/80 to-black/90 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] group-hover:border-purple-300 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.6)_50%)] bg-[size:100%_3px] opacity-40 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-[8px] font-mono text-purple-300 tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                            Global Ranking
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                            <Trophy size={18} className="text-purple-400 group-hover:text-yellow-400 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                            <span className="font-black tracking-widest text-base text-white group-hover:text-purple-100 drop-shadow-md">
                                TOP EARNERS
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* --- SECTION 3: TOP RIGHT (Reality & Score) --- */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-40" style={glitchStyle}>
                
                {/* A. Reality Indicator (Adds balance to the UI) */}
                <div className="flex items-center gap-2 skew-x-[12deg] bg-black/80 border border-gray-600 px-3 py-1 shadow-lg backdrop-blur-sm">
                    <Zap size={12} className="text-yellow-400 animate-pulse" />
                    <span className="text-[10px] text-gray-300 font-bold tracking-[0.2em] uppercase skew-x-[-12deg]">
                        REALITY: <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">LIGHT</span>
                    </span>
                </div>

                {/* B. Score Panel */}
                <div className={`relative border-2 border-amber-400 bg-black/90 backdrop-blur-md p-4 skew-x-[12deg] min-w-[200px] transition-all duration-75 ${
                    glitchIntensity > 0 ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}>
                    <div className="skew-x-[-12deg] text-right">
                        <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                            Net Yield (SOL)
                        </div>
                        <div className="text-4xl font-black text-amber-400 tracking-tighter drop-shadow-md">
                            {(score || 0).toLocaleString()}
                        </div>
                        {/* Decorative Corners */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-amber-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-amber-400"></div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 4: RIGHT CENTER (Mempool Feed) --- */}
            {/* Passing style to push it down so it doesn't overlap score */}
            <MempoolFeed kills={kills} />

            {/* --- SECTION 5: BOTTOM ELEMENTS --- */}
            
            {/* Health */}
            <div className="absolute bottom-6 left-6 z-40">
                <div className="relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-4 skew-x-[-12deg] min-w-[300px]">
                    <div className="skew-x-[12deg]">
                        <div className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2 flex justify-between">
                            <span>Integrity</span>
                            <span className={health < 30 ? "text-red-500 animate-pulse" : "text-amber-500"}>{Math.max(0, health)}%</span>
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: healthSegments }).map((_, i) => (
                                <div key={i} className={`h-3 flex-1 transition-all duration-300 ${
                                    i < filledSegments
                                        ? healthPercent > 50 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                        : healthPercent > 25 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                        : 'bg-gray-800'
                                }`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ammo */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40" style={glitchStyle}>
                <div className={`relative border-2 border-amber-400 bg-black/90 backdrop-blur-sm p-5 skew-x-[-12deg] transition-all duration-75 ${
                    glitchIntensity > 0 ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                }`}>
                    <div className="skew-x-[12deg] text-center min-w-[120px]">
                        <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                            {weaponName}
                        </div>
                        <div className={`text-5xl font-black tracking-tighter ${
                            glitchIntensity > 0 ? 'text-cyan-400'
                            : isReloading ? 'text-red-500 animate-pulse' 
                            : ammo === 0 ? 'text-red-500' 
                            : 'text-amber-400'
                        }`}>
                            {ammo} <span className="text-xl text-gray-600">/ {maxAmmo}</span>
                        </div>
                        {isReloading && (
                            <div className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest animate-pulse">
                                /// RELOADING ///
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grenades */}
            <div className="absolute bottom-6 right-6 z-40" style={glitchStyle}>
                <div className="relative border-2 border-amber-400 bg-black/80 backdrop-blur-sm p-4 skew-x-[12deg]">
                    <div className="skew-x-[-12deg] text-right">
                        <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                            Ord.
                        </div>
                        <div className="text-3xl font-black text-amber-400 tracking-tighter">
                            {grenades} <span className="text-sm text-gray-500">x</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals Overlay */}
            {isShopOpen && (
                <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <ShopModal onClose={() => setIsShopOpen(false)} />
                </div>
            )}
            {isLeaderboardOpen && (
                <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
                </div>
            )}
        </div>
    );
}