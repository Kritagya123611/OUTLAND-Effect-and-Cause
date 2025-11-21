import { useCallback } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useNavigate } from "react-router-dom";
import { Lock, Unlock, Zap, ShieldAlert, Terminal } from "lucide-react";

// --- ASSETS (Ensure these match your project structure or remove if using icons only) ---
// You can use the icons provided in lucide-react as placeholders if images aren't available

export default function LoginWrapper() {
  const endpoint = "https://api.mainnet-beta.solana.com";

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet })
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <Login />
      </WalletProvider>
    </ConnectionProvider>
  );
}

function Login() {
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col relative overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS (Matches Landing Page) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black opacity-60 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <header className="relative z-50 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-3xl text-amber-400 font-black italic tracking-tighter leading-none">
            PARALLEL
            <br />
            WORLDS
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-widest uppercase">
            <Terminal size={14} className="text-amber-500" />
            <span>Secure Uplink v.2.04</span>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex justify-center items-center px-6 relative z-10">
        
        {/* The "Card" */}
        <div className="w-full max-w-xl relative group">
            
          {/* Glowing Backing Effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-amber-500 to-red-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 ${connected ? "opacity-50" : "opacity-20"}`}></div>
          
          <div className="relative bg-black border border-white/10 p-8 md:p-12 overflow-hidden">
            
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-amber-500/50"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-amber-500/50"></div>

            {/* Header Section */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2">
                  IDENTITY
                  <br />
                  <span className="text-amber-500">VERIFICATION</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium tracking-wide">
                  Link your wallet to enter the anomaly.
                </p>
              </div>
              
              {/* Status Badge */}
              <div className={`px-3 py-1 border ${connected ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-red-900 bg-red-900/10 text-red-500"} text-[10px] font-bold uppercase tracking-widest flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${connected ? "bg-amber-400 animate-pulse" : "bg-red-500"}`}></div>
                {connected ? "LINKED" : "DISCONNECTED"}
              </div>
            </div>

            {/* --- STEP 1: WALLET SELECTORS --- */}
            <div className="space-y-6 mb-12">
               <div className="flex items-center gap-4">
                  <span className="bg-white text-black text-xs font-black px-2 py-1 skew-x-[-12deg]">01</span>
                  <span className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Choose Provider</span>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phantom */}
                  <button
                    onClick={() => connectWallet("Phantom")}
                    disabled={connected || connecting}
                    className={`
                      relative h-20 border-2 transition-all duration-300 flex items-center justify-center gap-3 group/btn
                      ${wallet?.adapter.name === 'Phantom' && connected 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-zinc-800 hover:border-white bg-zinc-900/50"
                      }
                      ${(connected && wallet?.adapter.name !== 'Phantom') ? "opacity-30 grayscale cursor-not-allowed" : ""}
                    `}
                  >
                    {/* Replaced simple box with visual cue if you don't have the SVG icon imported */}
                    <div className="w-6 h-6 bg-[#7b5cff] rounded-full flex items-center justify-center text-[10px] font-bold">P</div>
                    <span className={`text-sm font-bold tracking-wider uppercase ${wallet?.adapter.name === 'Phantom' && connected ? "text-white" : "text-gray-400 group-hover/btn:text-white"}`}>
                      Phantom
                    </span>
                    {wallet?.adapter.name === 'Phantom' && connected && <Zap size={16} className="text-amber-400 absolute top-2 right-2" />}
                  </button>

                  {/* Solflare */}
                  <button
                    onClick={() => connectWallet("Solflare")}
                    disabled={connected || connecting}
                    className={`
                      relative h-20 border-2 transition-all duration-300 flex items-center justify-center gap-3 group/btn
                      ${wallet?.adapter.name === 'Solflare' && connected 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-zinc-800 hover:border-white bg-zinc-900/50"
                      }
                      ${(connected && wallet?.adapter.name !== 'Solflare') ? "opacity-30 grayscale cursor-not-allowed" : ""}
                    `}
                  >
                     <div className="w-6 h-6 bg-[#FC7226] rounded-full flex items-center justify-center text-[10px] font-bold">S</div>
                    <span className={`text-sm font-bold tracking-wider uppercase ${wallet?.adapter.name === 'Solflare' && connected ? "text-white" : "text-gray-400 group-hover/btn:text-white"}`}>
                      Solflare
                    </span>
                    {wallet?.adapter.name === 'Solflare' && connected && <Zap size={16} className="text-amber-400 absolute top-2 right-2" />}
                  </button>
               </div>
            </div>

            {/* --- STEP 2: PLAY ACTION --- */}
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <span className="bg-white text-black text-xs font-black px-2 py-1 skew-x-[-12deg]">02</span>
                  <span className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase flex-1">Initialize Game</span>
                  {connected && <span className="text-amber-400 text-xs font-bold tracking-widest animate-pulse">READY</span>}
               </div>

               <button
                  onClick={() => navigate("/game")}
                  disabled={!connected}
                  className={`
                    w-full py-6 skew-x-[-12deg] transition-all duration-300 group relative overflow-hidden
                    ${connected 
                      ? "bg-amber-500 hover:bg-white cursor-pointer" 
                      : "bg-zinc-900 border border-zinc-800 cursor-not-allowed opacity-60"
                    }
                  `}
                >
                  {/* Button Content (Un-skewed) */}
                  <div className="skew-x-[12deg] flex items-center justify-center gap-3">
                    {connected ? (
                      <>
                        <span className="text-2xl font-black italic uppercase tracking-tighter text-black">ENTER THE RIFT</span>
                        <Unlock className="text-black" size={24} strokeWidth={3} />
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-bold uppercase tracking-widest text-gray-600">Awaiting Connection</span>
                        <Lock className="text-gray-600" size={20} />
                      </>
                    )}
                  </div>
                  
                  {/* Shine Effect when connected */}
                  {connected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>}
                </button>

                {connected && (
                  <div className="text-center mt-4">
                    <button 
                      onClick={disconnect}
                      className="text-xs text-gray-600 hover:text-red-500 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <ShieldAlert size={12} />
                      Terminate Session
                    </button>
                  </div>
                )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer decorative line */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    </div>
  );
}