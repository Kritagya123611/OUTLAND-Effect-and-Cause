import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy, Skull, RefreshCw, Download, ExternalLink, ShieldCheck,
  Activity, Wallet, Crosshair, BarChart3, Award, ChevronRight,
  Terminal, Share2, Copy, Monitor, Play
} from 'lucide-react';
// import { useGame } from './GameContext'; // Uncomment if using context

// Custom DollarSignIcon (moved inside for better organization)
const DollarSignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <line x1="12" x2="12" y1="2" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export default function GameEnd() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // const { player } = useGame();

  // Mock Data
  const result = state?.result || {
    won: true,
    actualKills: 5,
    targetKills: 3,
    payout: "2.50",
    wager: "1.00",
    txSignature: "5xG8...3j9L",
    accuracy: "87.4%",
    headshots: 4,
    damageDealt: 2450,
    duration: "14:22",
    xpGained: 1250,
    rank: "VETERAN II"
  };

  const [count, setCount] = useState(0);
  const [xpProgress, setXpProgress] = useState(0);

  const isWin = result.won;
  const primaryColor = isWin ? 'text-green-500' : 'text-red-500';
  const borderColor = isWin ? 'border-green-500' : 'border-red-600';
  const bgGlow = isWin ? 'from-green-500/5' : 'from-red-500/5';

  // Animations
  useEffect(() => {
    const target = parseFloat(result.payout);
    let start = 0;
    const increment = target / 60;
    const moneyTimer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(moneyTimer);
      } else {
        setCount(start);
      }
    }, 16);

    setTimeout(() => setXpProgress(75), 500);

    return () => clearInterval(moneyTimer);
  }, [result.payout]);

  // Enhanced marquee animation with CSS-in-JS equivalent via Tailwind (added custom class simulation)
  // Note: For full marquee, add to global CSS: @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 30s linear infinite; }

  return (
    <div className="h-screen w-full font-sans flex flex-col relative overflow-hidden bg-[#020202] text-white selection:bg-amber-500/30">
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
           style={{ 
             backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           }}>
      </div>
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] opacity-40 ${bgGlow} via-transparent to-transparent`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

      {/* --- HEADER BAR (New: Added for better orientation on all screens) --- */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/80 border-b border-zinc-900 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${primaryColor}`} />
          <span className={`text-sm font-mono uppercase tracking-wider ${primaryColor}`}>
            {isWin ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>Operator ID: OP_792</span>
          <span>Sector: ZONE_04</span>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        {/* === LEFT PANEL: MISSION STATUS === */}
        <div className="lg:col-span-4 border-r border-zinc-900 bg-black/40 backdrop-blur-sm flex flex-col relative">
          <div className={`w-full h-1 ${primaryColor}`}></div>
          <div className="p-6 md:p-8 lg:p-12 flex-1 flex flex-col justify-center items-start">
            <div className="flex items-center gap-3 mb-6 w-full">
              <div className={`w-3 h-3 rounded-full animate-pulse ${primaryColor}`} />
              <span className={`font-mono text-sm tracking-[0.2em] uppercase ${primaryColor} flex-1`}>
                {isWin ? 'Objective Achieved' : 'Extraction Failed'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 w-full text-left">
              {isWin ? (
                <>PAYOUT<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-700">SECURED</span></>
              ) : (
                <>MISSION<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">FAILED</span></>
              )}
            </h1>
            <div className="space-y-4 max-w-sm w-full">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Time Elapsed</span>
                <span className="font-bold">{result.duration}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Damage Dealt</span>
                <span className="font-bold">{result.damageDealt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Headshots</span>
                <span className="font-bold">{result.headshots}</span>
              </div>
            </div>
          </div>
          {/* Combat Stats Footer - Improved grid for better mobile stacking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-zinc-900 bg-zinc-900/10">
            <div className="p-4 sm:p-6 border-b sm:border-r border-zinc-900">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Kills</div>
              <div className="text-2xl md:text-3xl font-black text-white">{result.actualKills} <span className="text-lg text-zinc-600">/ {result.targetKills}</span></div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Accuracy</div>
              <div className="text-2xl md:text-3xl font-black text-amber-500">{result.accuracy}</div>
            </div>
          </div>
        </div>

        {/* === CENTER PANEL: FINANCIALS === */}
        <div className="lg:col-span-5 border-r border-zinc-900 flex flex-col justify-center items-center p-4 md:p-8 lg:p-12 bg-zinc-950/50 relative">
          <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Wallet size={14} /> Settlement Protocol
          </div>
          {/* The Big Receipt - Centered and responsive */}
          <div className="w-full max-w-md relative flex-1 flex items-center justify-center">
            <div className="absolute -inset-2 bg-gradient-to-b from-zinc-800 to-transparent opacity-20 blur rounded-lg"></div>
            <div className="relative bg-black border border-zinc-800 p-6 md:p-8 shadow-2xl w-full rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b border-zinc-800">
                <div className="flex flex-col mb-2 md:mb-0">
                  <span className="text-zinc-400 text-xs uppercase font-bold">Total Payout</span>
                  <span className={`text-4xl md:text-6xl font-black tracking-tighter ${primaryColor}`}>
                    {isWin ? '+' : '-'}{count.toFixed(2)}
                  </span>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className="text-xl md:text-2xl font-bold text-zinc-600">SOL</span>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-sm">
                  <span className="text-zinc-500">Initial Wager</span>
                  <span className="text-white font-bold">{result.wager} SOL</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-sm">
                  <span className="text-zinc-500">Risk Multiplier</span>
                  <span className="text-amber-500 font-bold">{(parseFloat(result.payout) / parseFloat(result.wager)).toFixed(2)}x</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-sm">
                  <span className="text-zinc-500">Gas Fees</span>
                  <span className="text-zinc-600">0.00005 SOL</span>
                </div>
              </div>
              {/* TX Hash - Improved accessibility with better hover states */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Blockchain Reference</div>
                <a
                  href={`https://solscan.io/tx/${result.txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between w-full bg-zinc-900 border border-zinc-800 p-3 md:p-4 hover:border-zinc-600 transition-all cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  aria-label="View transaction on Solscan"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ShieldCheck size={16} className={`${primaryColor} group-hover:scale-110 transition-transform`} />
                    <span className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors truncate">
                      {result.txSignature}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-zinc-600 group-hover:text-white ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT PANEL: PROGRESSION & ACTIONS === */}
        <div className="lg:col-span-3 bg-zinc-950 flex flex-col relative">
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 md:mb-6 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Rank Progress</span>
                  <span className="text-xl md:text-2xl font-black italic text-white">{result.rank}</span>
                </div>
                <span className="text-amber-500 font-mono text-sm font-bold">+{result.xpGained} XP</span>
              </div>
              {/* XP Bar - Enhanced with labels */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>0 XP</span>
                  <span className="font-mono">1000 / 5000 XP</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 relative overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000 ease-out relative shadow-sm"
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award size={14} /> Rewards Acquired
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-4 bg-black p-3 md:p-4 border border-zinc-900 hover:border-amber-500/30 transition-all group rounded-sm">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/50 transition-all rounded">
                    <Crosshair size={16} md:size={20} className="text-zinc-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white uppercase group-hover:text-amber-500 transition-colors truncate">Marksman</div>
                    <div className="text-[10px] text-zinc-500">Badge Unlocked</div>
                  </div>
                </div>
                {isWin && (
                  <div className="flex items-center gap-4 bg-black p-3 md:p-4 border border-zinc-900 hover:border-green-500/30 transition-all group rounded-sm">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-green-500/50 transition-all rounded">
                      <DollarSignIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white uppercase group-hover:text-green-500 transition-colors truncate">Bounty Hunter</div>
                      <div className="text-[10px] text-zinc-500">Payout Multiplier</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ACTION AREA - Sticky bottom with better mobile handling */}
          <div className="p-4 md:p-8 border-t border-zinc-900 bg-black/80 backdrop-blur-sm lg:sticky lg:bottom-0">
            <button
              onClick={() => navigate('/armory')}
              className={`w-full py-4 md:py-6 font-black uppercase italic text-base md:text-xl tracking-widest text-black flex items-center justify-center gap-2 md:gap-3 transition-all hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-sm
                ${isWin ? 'bg-amber-500' : 'bg-white'}
              `}
              aria-label={isWin ? 'Claim payout and redeploy' : 'Retry mission'}
            >
              {isWin ? (
                <>CLAIM & REDEPLOY <Play fill="black" size={14} md:size={16} /></>
              ) : (
                <>RETRY MISSION <RefreshCw size={16} md:size={18} /></>
              )}
            </button>
            <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4">
              <button 
                className="py-3 border border-zinc-800 text-zinc-500 font-bold uppercase text-xs md:text-[10px] tracking-widest hover:bg-zinc-900 hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                aria-label="Download mission report"
              >
                <Download size={12} className="inline mr-1" /> Download Report
              </button>
              <button 
                className="py-3 border border-zinc-800 text-zinc-500 font-bold uppercase text-xs md:text-[10px] tracking-widest hover:bg-zinc-900 hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                aria-label="Share mission replay"
              >
                <Share2 size={12} className="inline mr-1" /> Share Replay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SCROLLING TICKER FOOTER - Improved with better spacing and pause on hover --- */}
      <div className="relative z-20 bg-black border-t border-zinc-900 py-2 overflow-hidden flex items-center">
        <div className="flex items-center gap-8 md:gap-12 animate-marquee whitespace-nowrap text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest hover:pause">
          <span className="flex items-center gap-2 min-w-fit"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> GLOBAL VOLUME: 42,392 SOL</span>
          <span className="flex items-center gap-2 min-w-fit"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> RECENT WINNER: PLAYER_882 (+50 SOL)</span>
          <span className="flex items-center gap-2 min-w-fit"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> SECTOR 7: HIGH ACTIVITY</span>
          <span className="flex items-center gap-2 min-w-fit"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> NEW BOUNTY CONTRACTS DEPLOYED</span>
        </div>
      </div>
    </div>
  );
}