import React from 'react';
import { X, Trophy, TrendingUp, Wallet } from 'lucide-react';

interface Props {
    onClose: () => void;
}

// Fake Data for the Demo
const LEADERS = [
    { rank: 1, name: "Satoshi_Slayer", profit: "+145.2 SOL", winRate: "92%", status: "ONLINE" },
    { rank: 2, name: "Diamond_Hands_69", profit: "+89.5 SOL", winRate: "88%", status: "IN-GAME" },
    { rank: 3, name: "Solana_Whale_X", profit: "+42.0 SOL", winRate: "75%", status: "OFFLINE" },
    { rank: 4, name: "Rekt_City_Mayor", profit: "+12.4 SOL", winRate: "61%", status: "ONLINE" },
    { rank: 5, name: "Paper_Hands_007", profit: "-2.1 SOL", winRate: "45%", status: "LIQUIDATED" },
];

export default function LeaderboardModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="relative w-full max-w-2xl border-2 border-purple-500 bg-zinc-900 shadow-[0_0_50px_rgba(168,85,247,0.4)] skew-x-[-2deg]">
                
                {/* Header */}
                <div className="bg-purple-900/20 p-6 border-b border-purple-500/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Trophy size={32} className="text-yellow-400" />
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-purple-400 uppercase">Top Earners</h2>
                            <p className="text-xs text-purple-300 font-mono tracking-widest uppercase">Live Net Profit (24h)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-purple-500 hover:text-white transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-black/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-zinc-800">
                    <div className="text-center">Rank</div>
                    <div className="col-span-2">Operator</div>
                    <div className="text-right">Net Profit</div>
                    <div className="text-center">Status</div>
                </div>

                {/* List */}
                <div className="divide-y divide-zinc-800">
                    {LEADERS.map((leader) => (
                        <div key={leader.rank} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-purple-500/5 transition-colors group">
                            {/* Rank */}
                            <div className="flex justify-center">
                                <div className={`w-8 h-8 flex items-center justify-center font-black text-lg rounded-full 
                                    ${leader.rank === 1 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : 
                                      leader.rank === 2 ? 'bg-gray-300 text-black' : 
                                      leader.rank === 3 ? 'bg-amber-700 text-black' : 'text-gray-500'}`}>
                                    {leader.rank}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="col-span-2 flex flex-col">
                                <span className="text-white font-bold font-mono group-hover:text-purple-400 transition-colors">
                                    {leader.name}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <Wallet size={10} /> 
                                    <span>{leader.winRate} Win Rate</span>
                                </div>
                            </div>

                            {/* Profit */}
                            <div className={`text-right font-mono font-bold text-lg ${leader.profit.includes('+') ? 'text-green-400' : 'text-red-500'}`}>
                                {leader.profit}
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                    leader.status === 'ONLINE' ? 'bg-green-900/20 border-green-500 text-green-400 animate-pulse' :
                                    leader.status === 'IN-GAME' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-400' :
                                    leader.status === 'LIQUIDATED' ? 'bg-red-900/20 border-red-500 text-red-500 line-through' :
                                    'bg-gray-800 border-gray-600 text-gray-500'
                                }`}>
                                    {leader.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/80 border-t border-zinc-800 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span>LIVE FEED ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                        <TrendingUp size={12} />
                        <span>Global Volume: 4,203 SOL</span>
                    </div>
                </div>
                
                {/* Decorative Side Strip */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 via-transparent to-purple-500 opacity-50"></div>
            </div>
        </div>
    );
}