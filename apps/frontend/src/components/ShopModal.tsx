import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { useGameStore } from '../stores/useGameStore';
import { Rocket, ShieldAlert, X } from 'lucide-react';

// --- CONFIGURATION ---
// Replace this with your Phantom Wallet Address (same as Wager Modal is fine)
const TREASURY_WALLET = new PublicKey("9NYaoZPZfKd9JnzSRRE5U18UAko9EcBysL37Z2TxMzrG"); 

interface Props { onClose: () => void; }

export default function ShopModal({ onClose }: Props) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = useState(false);
    
    // Get actions from our "Brain"
    const { unlockRocketLauncher, addAmmo } = useGameStore();

    const buyAmmo = async () => {
        if (!publicKey) {
            alert("Connect Wallet to access the Black Market.");
            return;
        }
        
        setLoading(true);
        try {
            // --- THE TRANSACTION ---
            // 1. Build the transaction (0.05 SOL)
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: TREASURY_WALLET,
                    lamports: 0.05 * LAMPORTS_PER_SOL, 
                })
            );
            
            // 2. Ask user to sign
            const sig = await sendTransaction(transaction, connection);
            
            // 3. Wait for confirmation
            await connection.confirmTransaction(sig, 'confirmed');

            // 4. Give Rewards!
            unlockRocketLauncher();
            addAmmo(100); // 100 Rounds
            
            // 5. Success Feedback
            alert("TRANSACTION VERIFIED. WEAPONS UNLOCKED.");
            onClose();
            
        } catch (e) {
            console.error(e);
            alert("Transaction Failed. Insufficient funds or rejected.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative w-[450px] border-2 border-yellow-500 bg-zinc-900 p-0 shadow-[0_0_50px_rgba(234,179,8,0.3)] skew-x-[-2deg]">
                
                {/* Header */}
                <div className="bg-yellow-500/10 p-6 border-b border-yellow-500/30 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-yellow-400">BLACK MARKET</h2>
                        <p className="text-xs text-yellow-600 font-mono tracking-widest uppercase">Smuggled Goods // No Refunds</p>
                    </div>
                    <button onClick={onClose} className="text-yellow-600 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    
                    {/* The Item Card */}
                    <div className="relative group border border-zinc-700 hover:border-yellow-500 bg-black p-4 transition-all duration-300">
                        <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rotate-12 shadow-lg">
                            HOT ITEM
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-zinc-800 border border-zinc-600 group-hover:bg-yellow-500/20 transition-colors">
                                <Rocket size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase">RPG-7 Launcher</h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    High-explosive anti-armor projectile.
                                    <br />
                                    Includes <span className="text-green-400">100x Warheads</span>.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                            <div className="text-xs text-zinc-500 uppercase font-bold">Price</div>
                            <div className="text-2xl font-mono font-bold text-green-400">0.05 SOL</div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex gap-2 items-start text-[10px] text-zinc-500 font-mono">
                        <ShieldAlert size={14} className="shrink-0" />
                        <p>This transaction is irreversible. Equipment is linked to your current session DNA only.</p>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={buyAmmo}
                        disabled={loading}
                        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verifying Payment..." : "Purchase Access"}
                    </button>
                </div>
                
                {/* Decorative Strip */}
                <div className="h-1 w-full bg-stripes-yellow-black"></div>
            </div>
        </div>
    );
}