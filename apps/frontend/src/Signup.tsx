import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { Lock, Unlock, Zap, ShieldAlert, Terminal, ScanLine, Crosshair } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { connect, disconnect, select, connected, connecting, wallet } = useWallet();

  const connectWallet = useCallback(
    async (walletName: string) => {
      try {
        select(walletName as any);
        await connect();
      } catch (e) {
        console.error("Wallet connection error:", e);
      }
    },
    [select, connect]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col relative overflow-hidden">
      
      {/* --- GLOBAL ATMOSPHERE: Noise & Grid Overlay --- */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%]"></div>
      
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <header className="relative z-50 p-6 md:p-8 border-b border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="group cursor-pointer">
             <div className="text-2xl text-white font-black italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors duration-300">
              OUTLAND
              <br />
              <span className="text-amber-500 group-hover:text-white transition-colors duration-300">EFFECT</span> & CAUSE
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase border border-zinc-800 px-3 py-1 rounded-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Net_Status: Online</span>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex justify-center items-center px-6 relative z-10 py-12">
        
        {/* The "Card" */}
        <div className="w-full max-w-xl relative group perspective-1000">
            
          {/* Active Glow Border */}
          <div className={`absolute -inset-[1px] bg-gradient-to-b from-amber-500 to-transparent rounded-sm opacity-20 group-hover:opacity-40 transition duration-500 ${connected ? "opacity-100 from-black-500" : ""}`}></div>
          
          <div className="relative bg-black border border-white/10 p-8 md:p-12 overflow-hidden shadow-2xl">
            
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-500"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-500"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-500"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-500"></div>

            {/* Scanline Effect inside card */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

            {/* Card Header */}
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold tracking-widest text-xs uppercase">
                  <Terminal size={14} /> Secure Uplink
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
                  IDENTITY
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">VERIFICATION</span>
                </h1>
              </div>
              
              {/* Connection Status Indicator */}
              <div className="flex flex-col items-end gap-1">
                 <div className={`text-5xl font-black italic tracking-tighter ${connected ? "text-green-500" : "text-zinc-800"}`}>
                    {connected ? "100%" : "0%"}
                 </div>
                 <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Signal Strength</div>
              </div>
            </div>

            {/* --- STEP 1: WALLET SELECTORS --- */}
            <div className="space-y-8 mb-12 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="bg-amber-500 text-black text-sm font-black px-2 py-1 skew-x-[-12deg]">01</div>
                  <div className="h-[1px] bg-zinc-800 flex-1"></div>
                  <span className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Select Provider</span>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phantom */}
                  <button
                    onClick={() => connectWallet("Phantom")}
                    disabled={connected || connecting}
                    className={`
                      relative h-24 border transition-all duration-300 group/btn overflow-hidden
                      ${wallet?.adapter.name === 'Phantom' && connected 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-zinc-800 hover:border-amber-500/50 bg-zinc-900/40 hover:bg-zinc-900"
                      }
                      ${(connected && wallet?.adapter.name !== 'Phantom') ? "opacity-20 grayscale cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover/btn:opacity-100 transition-opacity text-amber-500">
                        <ScanLine size={16} />
                    </div>
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                       <div className="w-8 h-8 bg-[#7b5cff] rounded-full flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_#7b5cff60]">P</div>
                       <span className="text-sm font-bold tracking-widest uppercase text-white">Phantom</span>
                       <span className="text-[10px] text-zinc-500 tracking-wider uppercase group-hover/btn:text-amber-500 transition-colors">
                           {wallet?.adapter.name === 'Phantom' && connected ? "LINKED" : "DETECTED"}
                       </span>
                    </div>
                  </button>

                  {/* Solflare */}
                  <button
                    onClick={() => connectWallet("Solflare")}
                    disabled={connected || connecting}
                    className={`
                      relative h-24 border transition-all duration-300 group/btn overflow-hidden
                      ${wallet?.adapter.name === 'Solflare' && connected 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-zinc-800 hover:border-amber-500/50 bg-zinc-900/40 hover:bg-zinc-900"
                      }
                      ${(connected && wallet?.adapter.name !== 'Solflare') ? "opacity-20 grayscale cursor-not-allowed" : ""}
                    `}
                  >
                     <div className="absolute top-2 right-2 opacity-0 group-hover/btn:opacity-100 transition-opacity text-amber-500">
                        <ScanLine size={16} />
                    </div>
                     <div className="h-full flex flex-col items-center justify-center gap-2">
                       <div className="w-8 h-8 bg-[#FC7226] rounded-full flex items-center justify-center text-xs font-black text-white shadow-[0_0_15px_#FC722660]">S</div>
                       <span className="text-sm font-bold tracking-widest uppercase text-white">Solflare</span>
                        <span className="text-[10px] text-zinc-500 tracking-wider uppercase group-hover/btn:text-amber-500 transition-colors">
                           {wallet?.adapter.name === 'Solflare' && connected ? "LINKED" : "DETECTED"}
                       </span>
                    </div>
                  </button>
               </div>
            </div>

            {/* --- STEP 2: PLAY ACTION --- */}
            <div className="space-y-6 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="bg-white text-black text-sm font-black px-2 py-1 skew-x-[-12deg]">02</div>
                  <div className="h-[1px] bg-zinc-800 flex-1"></div>
                  <span className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Init Sequence</span>
               </div>

               <button
                  onClick={() => navigate("/Armory")}
                  disabled={!connected}
                  className={`
                    w-full py-6 skew-x-[-12deg] transition-all duration-300 group relative overflow-hidden border-2
                    ${connected 
                      ? "bg-amber-500 border-amber-500 hover:bg-white hover:border-white cursor-pointer shadow-[0_0_30px_rgba(251,191,36,0.3)]" 
                      : "bg-black border-zinc-800 cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  {/* Button Content (Un-skewed) */}
                  <div className="skew-x-[12deg] flex items-center justify-center gap-4">
                    {connected ? (
                      <>
                        <span className="text-2xl font-black italic uppercase tracking-tighter text-black group-hover:scale-110 transition-transform">ENTER THE RIFT</span>
                        <Zap className="text-black animate-pulse" size={24} fill="currentColor" />
                      </>
                    ) : (
                      <>
                        <Lock className="text-zinc-600" size={20} />
                        <span className="text-lg font-bold uppercase tracking-widest text-zinc-600">Locked // Awaiting Signal</span>
                      </>
                    )}
                  </div>
                  
                  {/* Scan overlay effect when locked */}
                  {!connected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                </button>

                {connected && (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <button 
                      onClick={disconnect}
                      className="text-[10px] text-zinc-500 hover:text-red-500 font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto border-b border-transparent hover:border-red-500 pb-1"
                    >
                      <ShieldAlert size={12} />
                      Abort Connection
                    </button>
                  </div>
                )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer decorative elements */}
      <div className="absolute bottom-6 left-6 text-[10px] text-zinc-600 font-mono hidden md:block">
         ID: 884-29-ALPHA <br/>
         SECURE_ENCLAVE_09
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] text-zinc-600 font-mono text-right hidden md:block">
         LATENCY: 12ms <br/>
         ENCRYPTION: AES-256
      </div>
    </div>
  );
}