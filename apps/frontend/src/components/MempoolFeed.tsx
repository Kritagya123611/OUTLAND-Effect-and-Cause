import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Hash, Radio } from "lucide-react";

type Kill = {
  id: string;
};

interface MempoolFeedProps {
  kills: Kill[];
}

export const MempoolFeed = ({ kills }: MempoolFeedProps) => (
  // POSITIONING: Fixed Top-Right, but pushed down (top-36) to clear the Score panel.
  <div className="fixed right-6 top-40 flex flex-col gap-3 pointer-events-none z-50">
    <AnimatePresence>
      {kills.map((kill) => (
        <motion.div
          key={kill.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, x: 50 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative w-96 group" // Increased width for better visibility
        >
          {/* Main Card Container */}
          <div className="bg-black/90 backdrop-blur-xl border-l-8 border-yellow-500 p-4 shadow-[0_0_30px_rgba(234,179,8,0.2)] clip-path-polygon relative overflow-hidden">
            
            {/* Background Animations */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

            {/* Header Row */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
              <div className="flex items-center gap-2 text-yellow-500">
                <Hash size={14} />
                <span className="font-mono text-xs font-bold tracking-widest text-gray-400">
                  TXID: <span className="text-yellow-400">{kill.id.slice(0, 12)}...</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono tracking-wider">
                <Radio size={10} className="animate-pulse" /> LIVE
              </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center gap-4">
              {/* Spinning Loader Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-md opacity-40 animate-pulse"></div>
                <Loader2 className="animate-spin text-yellow-400 relative z-10" size={32} />
              </div>
              
              {/* Text Info */}
              <div>
                <div className="text-white font-black text-2xl italic tracking-tighter uppercase leading-none drop-shadow-md">
                  TARGET ELIMINATED
                </div>
                <div className="text-yellow-400 text-xs font-mono font-bold mt-1 flex items-center gap-2">
                   <span>[ MEMPOOL: PENDING ]</span>
                   <span className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></span>
                </div>
              </div>
            </div>
            
            {/* Reward Badge (Simulated) */}
            <div className="absolute bottom-2 right-2">
                <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Reward</div>
                    <div className="text-lg font-black text-green-400 leading-none">+0.02 SOL</div>
                </div>
            </div>

          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);