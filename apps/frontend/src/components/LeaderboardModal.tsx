import React from 'react';
import { X, Trophy, TrendingUp, Wallet } from 'lucide-react';

interface Props {
    onClose: () => void;
}

// Fake Data for the Demo (Expanded to trigger scroll)
const LEADERS = [
    { rank: 1, name: "Satoshi_Slayer", profit: "+145.2 SOL", winRate: "92%", status: "ONLINE" },
    { rank: 2, name: "Diamond_Hands_69", profit: "+89.5 SOL", winRate: "88%", status: "IN-GAME" },
    { rank: 3, name: "Solana_Whale_X", profit: "+42.0 SOL", winRate: "75%", status: "OFFLINE" },
    { rank: 4, name: "Rekt_City_Mayor", profit: "+12.4 SOL", winRate: "61%", status: "ONLINE" },
    { rank: 5, name: "Paper_Hands_007", profit: "-2.1 SOL", winRate: "45%", status: "LIQUIDATED" },
    { rank: 6, name: "HODL_Master", profit: "+5.6 SOL", winRate: "53%", status: "ONLINE" },
    { rank: 7, name: "CryptoNinja", profit: "+8.3 SOL", winRate: "67%", status: "IN-GAME" },
    { rank: 8, name: "BlockChainBrawler", profit: "-4.7 SOL", winRate: "39%", status: "OFFLINE" },
    { rank: 9, name: "DeFi_Destroyer", profit: "+15.0 SOL", winRate: "72%", status: "ONLINE" },
    { rank: 10, name: "NFT_Nomad", profit: "+3.2 SOL", winRate: "50%", status: "IN-GAME" },
    { rank: 11, name: "Moon_Boi_420", profit: "-1.2 SOL", winRate: "42%", status: "ONLINE" },
    { rank: 12, name: "Laser_Eyes_Jim", profit: "+6.9 SOL", winRate: "58%", status: "OFFLINE" },
    { rank: 13, name: "WAGMI_Warrior", profit: "+22.1 SOL", winRate: "65%", status: "IN-GAME" },
    { rank: 14, name: "Rug_Pull_Survivor", profit: "-0.5 SOL", winRate: "48%", status: "ONLINE" },
    { rank: 15, name: "Alpha_Seeker", profit: "+11.8 SOL", winRate: "60%", status: "OFFLINE" },
];

export default function LeaderboardModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            {/* Custom Scrollbar Styles injected directly for this component */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #a855f7;
                    border-radius: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #c084fc;
                }
            `}</style>

            <div className="relative w-full max-w-2xl border-2 border-purple-500 bg-zinc-900 shadow-[0_0_50px_rgba(168,85,247,0.4)] skew-x-[-2deg] flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-purple-900/20 p-6 border-b border-purple-500/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Trophy size={32} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-purple-400 uppercase drop-shadow-md">Top Earners</h2>
                            <p className="text-xs text-purple-300 font-mono tracking-widest uppercase">Live Net Profit (24h)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-purple-500 hover:text-white transition-colors hover:rotate-90 duration-300">
                        <X size={24}/>
                    </button>
                </div>

                {/* Table Header (Fixed) */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-black/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-zinc-800 shrink-0">
                    <div className="text-center">Rank</div>
                    <div className="col-span-2">Operator</div>
                    <div className="text-right">Net Profit</div>
                    <div className="text-center">Status</div>
                </div>

                {/* Scrollable List */}
                <div className="overflow-y-auto custom-scrollbar divide-y divide-zinc-800 bg-black/20 flex-1">
                    {LEADERS.map((leader) => (
                        <div key={leader.rank} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-purple-500/10 transition-colors group cursor-default">
                            {/* Rank */}
                            <div className="flex justify-center">
                                <div className={`w-8 h-8 flex items-center justify-center font-black text-lg skew-x-[2deg]
                                    ${leader.rank === 1 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 
                                      leader.rank === 2 ? 'bg-zinc-300 text-black shadow-[0_0_15px_rgba(212,212,216,0.4)]' : 
                                      leader.rank === 3 ? 'bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.4)]' : 'text-zinc-600'}`}>
                                    {leader.rank}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="col-span-2 flex flex-col">
                                <span className="text-white font-bold font-mono group-hover:text-purple-400 transition-colors tracking-tight">
                                    {leader.name}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                                    <Wallet size={10} /> 
                                    <span>{leader.winRate} Win Rate</span>
                                </div>
                            </div>

                            {/* Profit */}
                            <div className={`text-right font-mono font-black text-lg tracking-tight ${leader.profit.includes('+') ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]' : 'text-red-500'}`}>
                                {leader.profit}
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                                <span className={`text-[10px] font-bold px-2 py-1 border skew-x-[2deg] ${
                                    leader.status === 'ONLINE' ? 'bg-green-900/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                                    leader.status === 'IN-GAME' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-400' :
                                    leader.status === 'LIQUIDATED' ? 'bg-red-900/20 border-red-500 text-red-500 line-through opacity-70' :
                                    'bg-gray-800 border-gray-600 text-gray-500'
                                }`}>
                                    {leader.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/80 border-t border-purple-500/30 flex justify-between items-center text-[10px] text-gray-500 font-mono shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-green-500 font-bold">LIVE FEED ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                        <TrendingUp size={12} />
                        <span className="font-bold tracking-wider">Global Vol: 4,203 SOL</span>
                    </div>
                </div>
                
                {/* Decorative Side Strip */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 via-transparent to-purple-500 opacity-50"></div>
            </div>
        </div>
    );
}