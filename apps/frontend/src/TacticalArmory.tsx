// TacticalArmory.tsx
import React, { useState } from 'react';
import { Shield, Zap, Crosshair, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TacticalArmory = () => {
  const [selectedTier, setSelectedTier] = useState(2);
  const [fastMode, setFastMode] = useState(false);
  const navigate = useNavigate();

  const tiers = [
    {
      id: 1,
      name: 'SCOUT',
      bet: '0.1 SOL',
      reward: '1.5x',
      desc: 'Standard Issue Pistol.',
      risk: 'LOW',
      icon: <Crosshair className="w-6 h-6" />,
    },
    {
      id: 2,
      name: 'SOLDIER',
      bet: '0.5 SOL',
      reward: '2.0x',
      desc: 'Suppressed SMG.',
      risk: 'MED',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: 3,
      name: 'HEAVY',
      bet: '1.0 SOL',
      reward: '3.0x',
      desc: 'Rocket Launcher.',
      risk: 'HIGH',
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ];

  return (
    <div className="h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* BACKGROUND GRID (Matches your Auth Screen) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 p-6 md:p-8 border-b border-zinc-800 bg-black/80 backdrop-blur-sm flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
            Loadout <span className="text-amber-500">Selection</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-1 bg-amber-500"></div>
            <p className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase font-bold">
              Select your wager tier to initialize uplink
            </p>
          </div>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-zinc-600 text-xs uppercase tracking-widest">System Status</p>
           <p className="text-amber-500 font-bold tracking-wider animate-pulse">ONLINE</p>
        </div>
      </div>

      {/* MAIN CONTENT - CARDS (Flex-1 ensures they fill available vertical space) */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-0 md:gap-px bg-zinc-800/50">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`
              group relative flex-1 flex flex-col justify-between p-6 md:p-10 text-left transition-all duration-200
              hover:bg-zinc-900 focus:outline-none
              ${selectedTier === tier.id 
                ? 'bg-zinc-900 border-x-0 md:border-x border-amber-500 z-20' 
                : 'bg-black border-zinc-800'
              }
            `}
          >
            {/* Selection Indicator (Top Bar) */}
            {selectedTier === tier.id && (
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            )}

            {/* Card Content */}
            <div className="w-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-xs font-bold tracking-[0.2em] px-2 py-1 
                  ${selectedTier === tier.id ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  TIER 0{tier.id} // {tier.risk} RISK
                </span>
                <span className={`transition-colors duration-300 ${selectedTier === tier.id ? 'text-amber-500' : 'text-zinc-700'}`}>
                    {tier.icon}
                </span>
              </div>
              
              <h2 className={`text-3xl md:text-4xl font-black italic mb-2 uppercase
                ${selectedTier === tier.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {tier.name}
              </h2>
              <p className="text-zinc-500 text-sm font-mono border-l-2 border-zinc-800 pl-3 uppercase">
                {tier.desc}
              </p>
            </div>

            {/* Bottom Stats */}
            <div className="mt-8 space-y-1">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2 mb-2">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Entry Fee</span>
                <span className={`text-2xl font-black tracking-tighter ${selectedTier === tier.id ? 'text-white' : 'text-zinc-400'}`}>
                  {tier.bet}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Potential Payout</span>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span className="text-xl font-bold text-amber-500">{tier.reward}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="relative z-10 shrink-0 bg-black border-t border-zinc-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        
        {/* Fast Mode Toggle */}
        <div 
          onClick={() => setFastMode(!fastMode)}
          className="flex items-center gap-4 cursor-pointer group w-full md:w-auto"
        >
          <div className={`w-12 h-6 border transition-colors duration-200 flex items-center px-1
            ${fastMode ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-700 bg-transparent'}`}>
            <div className={`w-4 h-4 bg-current transition-all duration-200 
              ${fastMode ? 'translate-x-6 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-zinc-600'}`} 
            />
          </div>
          <div>
            <div className={`text-sm font-bold uppercase tracking-wider transition-colors ${fastMode ? 'text-white' : 'text-zinc-500'}`}>
              Fast Mode
            </div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
              {fastMode ? 'Auto-Sign Transactions' : 'Manual Approval'}
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <button 
          onClick={() => navigate("/prediction")}
          className="w-full md:flex-1 bg-amber-500 hover:bg-amber-400 text-black h-16 
                     font-black text-xl uppercase italic tracking-widest transition-all 
                     hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:translate-y-1 flex items-center justify-center gap-3"
        >
          <span>{fastMode ? 'Instant Deploy' : 'Connect & Enter Rift'}</span>
          <Zap className="w-5 h-5 fill-black" />
        </button>

      </div>
    </div>
  );
};

export default TacticalArmory;