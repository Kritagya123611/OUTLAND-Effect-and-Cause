import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { useGameStore } from '../stores/useGameStore';
import { Rocket, ShieldAlert, X, Crosshair, Zap } from 'lucide-react';

const TREASURY_WALLET = new PublicKey("9NYaoZPZfKd9JnzSRRE5U18UAko9EcBysL37Z2TxMzrG");

interface Props { onClose: () => void; }

const ITEMS = [
    {
        id: 'rpg',
        name: 'RPG-7 Launcher',
        desc: 'High-explosive anti-armor projectile.',
        subdesc: 'Includes 100x Warheads.',
        price: 0.05,
        icon: <Rocket size={32} className="text-white" />,
        color: 'text-green-400',
        action: (store: any) => { store.unlockRocketLauncher(); store.addAmmo(100); }
    },
    {
        id: 'minigun',
        name: 'M134 Minigun',
        desc: 'Rotary barrel machine gun.',
        subdesc: 'Includes 500x Rounds.',
        price: 0.08,
        icon: <Crosshair size={32} className="text-white" />,
        color: 'text-purple-400',
        action: () => alert("Minigun Out of Stock (Coming Soon)")
    },
    {
        id: 'energy',
        name: 'Void Cell',
        desc: 'Instant reactor recharge.',
        subdesc: '+50% Energy Boost.',
        price: 0.02,
        icon: <Zap size={32} className="text-white" />,
        color: 'text-cyan-400',
        action: () => alert("Energy Recharged!")
    },
    {
        id: 'shield',
        name: 'Deflector Shield',
        desc: 'Temporary energy shield.',
        subdesc: '+50 Health Points.',
        price: 0.03,
        icon: <ShieldAlert size={32} className="text-white" />,
        color: 'text-yellow-400',
        action: (store: any) => { store.setGameStats({ health: Math.min(store.health + 50, store.maxHealth) }); }
    },
    {
        id: 'ammo',
        name: 'Ammo Pack',
        desc: 'Assorted ammunition.',
        subdesc: '+200 Rounds.',
        price: 0.01,
        icon: <ShieldAlert size={32} className="text-white" />,
        color: 'text-red-400',
        action: (store: any) => { store.addAmmo(200); }
    },
    {
        id: 'grenade',
        name: 'Frag Grenade',
        desc: 'High-damage explosive.',
        subdesc: '+5 Grenades.',
        price: 0.015,
        icon: <ShieldAlert size={32} className="text-white" />,
        color: 'text-orange-400',
        action: (store: any) => { store.setGameStats({ grenades: store.grenades + 5 }); }
    }
];

export default function ShopModal({ onClose }: Props) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = useState<string | null>(null);
    const gameStore = useGameStore();

    const buyItem = async (item: typeof ITEMS[0]) => {
        if (!publicKey) return alert("Connect Wallet to access the Black Market.");

        setLoading(item.id);
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: TREASURY_WALLET,
                    lamports: item.price * LAMPORTS_PER_SOL,
                })
            );

            const sig = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(sig, 'confirmed');
            item.action(gameStore);

            alert(`TRANSACTION VERIFIED. ${item.name} ACQUIRED.`);
            onClose();
        } catch {
            alert("Transaction Failed.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative w-[800px] border-2 border-yellow-500 bg-zinc-900 p-0 shadow-[0_0_50px_rgba(234,179,8,0.3)] skew-x-[-2deg]">

                {/* 🔥 BLACK MARKET HEADER (fixed & fully styled like marketpool) */}
                <div className="relative bg-gray-900/90 backdrop-blur-md border-l-4 border-yellow-500 p-6 shadow-[0_0_20px_rgba(234,179,8,0.3)] overflow-hidden">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-yellow-400">
                                BLACK MARKET
                            </h2>
                            <p className="text-[10px] text-yellow-600 font-mono tracking-widest uppercase">
                                Smuggled Goods // No Refunds
                            </p>
                        </div>

                        <button onClick={onClose} className="text-yellow-600 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="text-xs font-mono text-yellow-500 flex items-center gap-1 tracking-widest">
                        <span>SECURE CHANNEL</span>
                        <span className="animate-pulse">●</span>
                    </div>

                    {/* FIX — scanline overlay BEHIND the header */}
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-50"></div>
                </div>

                {/* ITEM CARDS */}
                <div className="p-8 overflow-x-auto">
                    <div className="flex gap-6 pb-4">
                        {ITEMS.map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-[300px] relative group border border-zinc-700 hover:border-yellow-500 bg-black p-6 transition-all duration-300 flex flex-col justify-between">
                                <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rotate-12 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    AVAILABLE
                                </div>

                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-zinc-800 border border-zinc-600 group-hover:bg-yellow-500/20 transition-colors">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase leading-none">
                                            {item.name}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-zinc-400 mb-1">{item.desc}</p>
                                    <p className={`text-xs font-bold ${item.color}`}>{item.subdesc}</p>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mb-4">
                                        <div className="text-xs text-zinc-500 uppercase font-bold">Price</div>
                                        <div className="text-2xl font-mono font-bold text-green-400">
                                            {item.price} SOL
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => buyItem(item)}
                                        disabled={!!loading}
                                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading === item.id ? "Verifying..." : "Purchase"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black p-3 border-t border-yellow-500/30 flex gap-2 items-center justify-center text-[10px] text-zinc-500 font-mono">
                    <ShieldAlert size={14} className="shrink-0" />
                    <p>Transactions are irreversible. Equipment is linked to your current session DNA only.</p>
                </div>

                <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,#EAB308,#EAB308_10px,#000_10px,#000_20px)]"></div>
            </div>
        </div>
    );
}
