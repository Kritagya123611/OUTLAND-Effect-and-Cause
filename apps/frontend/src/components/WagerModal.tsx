// apps/frontend/src/components/WagerModal.tsx
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useGameStore } from '../stores/useGameStore';

// --- CONFIGURATION ---
// 1. For the Hackathon, generate a fresh wallet in Phantom, copy its address, and paste it here.
// 2. This acts as the "House" wallet that collects the entry fees.
const HOUSE_PUBKEY = new PublicKey("9NYaoZPZfKd9JnzSRRE5U18UAko9EcBysL37Z2TxMzrG"); 

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function WagerModal({ onConfirm, onCancel }: Props) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = useState(false);
    const setWagerActive = useGameStore(state => state.setWagerActive);

    const handleWager = async () => {
        if (!publicKey) {
            alert("Please connect your wallet first!");
            return;
        }

        setLoading(true);

        try {
            // --- THE BLOCKCHAIN LOGIC ---
            // Create a transaction to send 0.1 SOL to the House
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: HOUSE_PUBKEY,
                    lamports: 0.1 * LAMPORTS_PER_SOL, // 0.1 SOL
                })
            );

            // Request signature from Phantom
            const signature = await sendTransaction(transaction, connection);
            
            // Wait for confirmation
            await connection.confirmTransaction(signature, 'processed');
            
            console.log("WAGER SECURED:", signature);
            
            // Update Game State
            setWagerActive(true); 
            onConfirm(); // Proceed to Dark World

        } catch (error) {
            console.error("Wager Failed:", error);
            // In a real game, show a nice toast notification. For hackathon, alert is fine.
            alert("Transaction Rejected. You remain in the Light World.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-[500px] border-2 border-red-600 bg-gray-900 p-8 text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] skew-x-[-5deg] relative overflow-hidden">
                
                {/* Decorative Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>

                <h2 className="relative mb-4 text-4xl font-black tracking-tighter text-red-500 animate-pulse">
                    ⚠️ ANOMALY DETECTED
                </h2>
                
                <div className="relative border border-red-900/50 bg-black/50 p-4 mb-6 font-mono text-sm text-gray-300 text-left">
                    <p className="mb-2"><span className="text-red-500 font-bold"></span> SCANNING REALITY...</p>
                    <p className="mb-2"><span className="text-red-500 font-bold"></span> TARGET: DARK WORLD (ZERO-G)</p>
                    <p><span className="text-red-500 font-bold"></span> CONNECTION UNSTABLE.</p>
                </div>

                <p className="relative mb-8 text-gray-300 font-bold">
                    To bridge the connection, you must stake collateral.
                    <br />
                    <span className="text-xs uppercase tracking-widest text-gray-500">(Winner takes the pot)</span>
                </p>

                <div className="relative mb-8 flex justify-center gap-4 text-sm font-mono">
                    <div className="bg-black p-3 border border-gray-700 min-w-[120px]">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Entry Cost</div>
                        <div className="text-red-500 font-black text-xl">0.1 SOL</div>
                    </div>
                    <div className="bg-black p-3 border border-gray-700 min-w-[120px]">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Potential Payout</div>
                        <div className="text-green-400 font-black text-xl">0.18 SOL</div>
                    </div>
                </div>

                <div className="relative flex gap-4 justify-center">
                    <button 
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white font-bold uppercase tracking-wider transition-all skew-x-[10deg]"
                    >
                        <span className="skew-x-[-10deg] block">Abort</span>
                    </button>
                    <button 
                        onClick={handleWager}
                        disabled={loading}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] skew-x-[10deg]"
                    >
                        <span className="skew-x-[-10deg] flex items-center gap-2">
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    STAKE 0.1 SOL
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}