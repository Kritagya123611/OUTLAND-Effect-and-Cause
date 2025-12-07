// PredictionTerminal.tsx
import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, Crosshair, Lock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PredictionTerminal = () => {
  const navigate = useNavigate();
  const [kills, setKills] = useState(3);
  const [bet, setBet] = useState(0.5);
  const [isHovering, setIsHovering] = useState(null);

  const calculateWin = () => {
    return (bet * (1 + (kills * 0.2))).toFixed(2);
  };

  const killOptions = [
    { value: 1, label: 'ROOKIE', risk: '90% WR' },
    { value: 3, label: 'VETERAN', risk: '60% WR' },
    { value: 5, label: 'ELITE', risk: '30% WR' },
    { value: 10, label: 'LEGEND', risk: '5% WR' },
  ];

  return (
    <div className="h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      
      <div className="relative z-10 w-full max-w-7xl h-full md:h-[85vh] flex flex-col md:flex-row border-y md:border border-zinc-800 bg-black/90 backdrop-blur-sm">
        

        <div className="flex-1 border-r border-zinc-800 p-8 flex flex-col">
          

          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 bg-amber-500 animate-pulse" />
               <span className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase">Market Open</span>
            </div>
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-2">
              Prediction <span className="text-zinc-700">Protocol</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest border-l border-amber-500 pl-3">
              Configure your performance parameters
            </p>
          </div>

          <div className="mb-12">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              <Crosshair className="w-4 h-4 text-amber-500" />
              01. Select Kill Target
            </label>
            <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
              {killOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setKills(option.value)}
                  onMouseEnter={() => setIsHovering(option.value)}
                  onMouseLeave={() => setIsHovering(null)}
                  className={`relative p-6 text-left transition-all duration-200 group
                    ${kills === option.value 
                      ? 'bg-zinc-100 text-black' 
                      : 'bg-black text-zinc-500 hover:bg-zinc-900'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-black italic">{option.value}</span>
                    {kills === option.value && <div className="w-2 h-2 bg-amber-500" />}
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase opacity-60">
                    {option.label}
                  </div>
                  <div className={`text-[10px] mt-2 font-mono
                     ${kills === option.value ? 'text-zinc-600' : 'text-zinc-700'}
                  `}>
                    EST. PROBABILITY: {option.risk}
                  </div>
                  
                  {kills === option.value && (
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-4">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <Activity className="w-4 h-4 text-amber-500" />
                02. Set Wager (SOL)
              </label>
              <div className="text-4xl font-black italic text-white">{bet.toFixed(1)}</div>
            </div>
            
            <div className="relative h-12 w-full bg-zinc-900 border border-zinc-800 flex items-center px-2">
              <input 
                type="range" 
                min="0.1" 
                max="5.0" 
                step="0.1"
                value={bet}
                onChange={(e) => setBet(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-0"
              />

              <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-px h-2 bg-zinc-800" />
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="w-full md:w-[450px] bg-zinc-900/50 flex flex-col p-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-black italic text-black leading-none opacity-50 select-none pointer-events-none">
                {kills}
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <div className="bg-black border border-zinc-800 p-6 mb-6">
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Potential Payout</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-amber-500 text-6xl font-black italic tracking-tighter">
                            {calculateWin()}
                        </span>
                        <span className="text-xl font-bold text-white">SOL</span>
                    </div>
                </div>

                <div className="border-l-2 border-red-500 bg-red-500/5 p-4 mb-8">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Risk Assessment</span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed uppercase">
                        Failure to eliminate <span className="text-white font-bold">{kills} hostiles</span> will result in total loss of the <span className="text-white font-bold">{bet} SOL</span> wager. smart contract is immutable.
                    </p>
                </div>
            </div>

            <button 
                onClick={() => navigate("/streaming")}
                className="relative w-full group overflow-hidden bg-amber-500 p-6 transition-all hover:bg-white"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-2xl font-black italic uppercase tracking-widest text-black">
                        GO LIVE
                    </span>
                    <Lock className="w-6 h-6 text-black" />
                </div>
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>

            <br></br>
            <button 
                onClick={() => navigate("/game")}
                className="relative w-full group overflow-hidden bg-amber-500 p-6 transition-all hover:bg-white"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-2xl font-black italic uppercase tracking-widest text-black">
                        LOCK PREDICTION
                    </span>
                    <Lock className="w-6 h-6 text-black" />
                </div>
                <div className="absolute inset-0 bg-white transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>
            
            <div className="mt-4 flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                <span>Network: Solana Mainnet</span>
                <span>Oracle: Pyth v2.0</span>
            </div>

        </div>

      </div>
    </div>
  );
};

export default PredictionTerminal;