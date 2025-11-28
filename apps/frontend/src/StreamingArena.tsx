// StreamingArena.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, Users, Zap, Camera, Radio, Crosshair, Terminal, Activity, DollarSign, Target, WifiOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
interface Slot {
  id: number;
  status: 'live' | 'empty';
  user?: string;
  viewers?: number;
  isMuted?: boolean;
}

interface ChatMessage {
  user: string;
  text: string;
  type: 'system' | 'user';
  timestamp?: number;
}

interface PlayerSession {
  tier?: number;
  wager?: number;
  prediction?: number;
  payout?: string;
  status?: string;
}

// --- SOCKET INIT ---
const socket: Socket = io('http://localhost:3001');

export default function StreamingArena() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'chat' | 'intel'>('chat');
  const [sessionData, setSessionData] = useState<PlayerSession | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // Camera State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mySlotId, setMySlotId] = useState<number | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- LISTENERS ---
  useEffect(() => {
    // Socket Connection Status
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Data Listeners
    socket.on('state_update', (serverSlots: Slot[]) => setSlots(serverSlots));
    socket.on('chat_message', (msg: ChatMessage) => setChatMessages((prev) => [...prev, msg]));
    socket.on('chat_history', (history: ChatMessage[]) => setChatMessages(history));
    
    // Session Data
    socket.on('session_data', (data: PlayerSession) => {
      console.log("Received Session Data:", data);
      setSessionData(data);
    });

    socket.on('error', (err: string) => alert(`Error: ${err}`));

    // Request Data
    socket.emit('get_session_data');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state_update');
      socket.off('chat_message');
      socket.off('chat_history');
      socket.off('session_data');
      socket.off('error');
    };
  }, []);

  // --- VIDEO REF HANDLER ---
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, slots]);

  // --- AUTO SCROLL ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- ACTIONS ---
  const handleClaimSlot = async (id: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setMySlotId(id);
      
      const username = `OPERATOR_${Math.floor(Math.random() * 900) + 100}`;
      socket.emit('claim_slot', { slotId: id, username });
    } catch (err) {
      console.error("Camera Error:", err);
      alert("ACCESS DENIED: Camera permissions required for uplink.");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const username = `OP_${socket.id?.slice(0, 3).toUpperCase() || 'UNK'}`;
    socket.emit('send_message', { user: username, text: msgInput, type: 'user' });
    setMsgInput('');
  };

  return (
    <div className="h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* BACKGROUND GRID EFFECT */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 h-20 border-b border-zinc-800 bg-black/90 backdrop-blur-md flex justify-between items-center px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black italic tracking-tighter text-white leading-none">
              OUT<span className="text-amber-500">LAST</span>
            </h1>
            <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase">
              Secure Uplink v2.04
            </span>
          </div>
          
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1">
            <div className={`w-2 h-2 rounded-sm ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-zinc-400">
              SIGNAL: {isConnected ? 'STABLE' : 'SEARCHING'}
            </span>
          </div>
        </div>

        {/* SESSION INTEL (For Judges) */}
        {sessionData && (
          <div className="hidden lg:flex items-center gap-6 bg-zinc-900/50 border border-zinc-800 px-4 py-2 skew-x-[-10deg]">
             <div className="flex flex-col items-end skew-x-[10deg]">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Active Wager</span>
                <span className="text-sm font-black text-amber-500 leading-none flex items-center gap-1">
                   <DollarSign size={12} /> {sessionData.wager} SOL
                </span>
             </div>
             <div className="w-px h-6 bg-zinc-800 skew-x-[10deg]"></div>
             <div className="flex flex-col items-start skew-x-[10deg]">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Objective</span>
                <span className="text-sm font-black text-white leading-none flex items-center gap-1">
                   <Target size={12} /> {sessionData.prediction} KILLS
                </span>
             </div>
          </div>
        )}

        {/* Back Button */}
        <button onClick={() => navigate("/game")} className="group relative bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 transition-all duration-200 clip-path-slant">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
            <Zap size={16} fill="black" />
            <span>ENTER THE ARENA</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        
        {/* LEFT: VIDEO GRID */}
        <div className="flex-1 p-6 relative">
          
          {/* OFFLINE STATE OVERLAY */}
          {(!isConnected || slots.length === 0) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
               <WifiOff className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
               <h2 className="text-xl font-black italic text-zinc-500 uppercase tracking-widest">Signal Lost</h2>
               <p className="text-zinc-600 font-mono text-xs mt-2">Attempting to re-establish uplink...</p>
               <p className="text-zinc-700 font-mono text-[10px] mt-4">Make sure 'node server.js' is running</p>
            </div>
          )}

          <div className="h-full grid grid-cols-2 grid-rows-2 gap-4">
            {slots.map((slot) => (
              <div 
                key={slot.id} 
                className={`relative group overflow-hidden transition-all duration-300
                  ${slot.status === 'live' 
                    ? 'bg-black border-2 border-zinc-800' 
                    : 'bg-zinc-900/20 border border-zinc-800 border-dashed hover:bg-zinc-900/40 hover:border-amber-500/50'
                  }`}
              >
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-zinc-600 group-hover:border-amber-500 transition-colors z-20" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-600 group-hover:border-amber-500 transition-colors z-20" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-600 group-hover:border-amber-500 transition-colors z-20" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-zinc-600 group-hover:border-amber-500 transition-colors z-20" />

                {slot.status === 'live' ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                      {slot.id === mySlotId && localStream ? (
                        <video 
                          ref={localVideoRef}
                          autoPlay muted playsInline
                          className="w-full h-full object-cover transform scale-x-[-1] opacity-90"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <img 
                            src={`https://api.dicebear.com/7.x/shapes/svg?seed=${slot.user}`} 
                            className="w-full h-full object-cover opacity-30 grayscale" 
                            alt="signal"
                          />
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <Activity className="text-zinc-600 w-16 h-16 opacity-50 animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30">
                      <div className="flex gap-2">
                         <div className="bg-red-600/90 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/> 
                           LIVE FEED
                         </div>
                      </div>
                      <div className="bg-black/80 backdrop-blur border border-zinc-700 px-2 py-1 flex items-center gap-2 text-amber-500 font-mono text-xs">
                          <Users size={12} />
                          <span>{slot.viewers || 0}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 z-30 pt-12">
                       <div className="flex justify-between items-end border-l-2 border-amber-500 pl-3">
                          <div>
                             <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-1">Operative</div>
                             <div className="text-xl font-black italic uppercase text-white leading-none">
                                {slot.user} {slot.id === mySlotId && <span className="text-amber-500 text-xs not-italic align-top ml-1">(YOU)</span>}
                             </div>
                          </div>
                          {slot.isMuted ? <MicOff size={18} className="text-red-500" /> : <Mic size={18} className="text-green-500" />}
                       </div>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => handleClaimSlot(slot.id)}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 z-10 relative"
                  >
                    <div className="w-20 h-20 border border-zinc-700 bg-zinc-900/50 flex items-center justify-center group-hover:border-amber-500 group-hover:bg-amber-500/10 transition-all duration-300">
                      <Crosshair className="text-zinc-600 group-hover:text-amber-500 transition-colors w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-black italic uppercase text-lg group-hover:text-amber-500 transition-colors">
                        Initialize Feed
                      </div>
                      <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest mt-1">
                        Slot {slot.id + 1} Available
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TACTICAL LOG & INTEL */}
        <div className="w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0 relative z-20">
          
          {/* TABS */}
          <div className="flex border-b border-zinc-800 bg-black">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors
              ${activeTab === 'chat' ? 'bg-zinc-900 text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Terminal size={12} className="absolute left-4 top-1/2 -translate-y-1/2" />
              Tactical Log
            </button>
            <button 
              onClick={() => setActiveTab('intel')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors
              ${activeTab === 'intel' ? 'bg-zinc-900 text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-white'}`}
            >
              Mission Intel
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="relative flex-1 overflow-y-auto font-mono text-xs bg-black">
             {/* FIXED NOISE OVERLAY: Reduced opacity to 5% */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0" />

             {/* --- CHAT TAB --- */}
             {activeTab === 'chat' && (
               <div className="relative z-10 p-4 space-y-3">
                 {chatMessages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 opacity-50 py-10">
                      <Radio className="animate-pulse" />
                      <span className="tracking-widest">ESTABLISHING SECURE LINK...</span>
                   </div>
                 )}
                 {chatMessages.map((msg, idx) => (
                   <div key={idx} className={`animate-in fade-in slide-in-from-bottom-2 duration-300
                      ${msg.type === 'system' ? 'border-l-2 border-amber-500/30 pl-2 py-1' : ''}
                   `}>
                     {msg.type === 'system' ? (
                       <div className="text-amber-500/70">
                          <span className="mr-2 opacity-50">{'>'}</span>
                          <span className="uppercase tracking-wide">{msg.text}</span>
                       </div>
                     ) : (
                       <div className="group flex gap-3 hover:bg-zinc-900/50 p-1 -mx-1 rounded-sm transition-colors">
                          <span className="font-bold text-zinc-400 group-hover:text-amber-500 transition-colors cursor-pointer">
                            {msg.user}
                          </span>
                          <span className="text-zinc-300">{msg.text}</span>
                       </div>
                     )}
                   </div>
                 ))}
                 <div ref={chatEndRef} />
               </div>
             )}

             {/* --- INTEL TAB (Back-end Proof) --- */}
             {activeTab === 'intel' && (
               <div className="relative z-10 p-6 space-y-8 animate-in fade-in duration-300">
                 {sessionData ? (
                   <>
                     <div>
                       <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                         <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Loadout Status</span>
                       </div>
                       <div className="bg-zinc-900/50 border border-zinc-700 p-4">
                          <div className="text-white font-black italic text-2xl mb-1">TIER 0{sessionData.tier || '?'}</div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-zinc-500">OPERATIONAL STATUS</span>
                            <span className="text-green-500 font-bold">{sessionData.status || 'DEPLOYED'}</span>
                          </div>
                       </div>
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
                         <Activity size={12} className="text-amber-500" />
                         <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Financial Risk</span>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-zinc-500 text-xs uppercase">Initial Wager</span>
                             <span className="text-white font-bold font-mono text-lg">{sessionData.wager} SOL</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-zinc-500 text-xs uppercase">Kill Objective</span>
                             <span className="text-white font-bold font-mono text-lg">{sessionData.prediction} KILLS</span>
                          </div>
                          
                          <div className="h-px bg-zinc-800 w-full" />
                          
                          <div className="flex justify-between items-center bg-amber-500/10 p-3 border border-amber-500/20">
                             <span className="text-amber-500 text-xs font-bold uppercase">Potential Payout</span>
                             <span className="text-amber-500 font-black text-2xl">{sessionData.payout} SOL</span>
                          </div>
                       </div>
                     </div>
                   </>
                 ) : (
                   <div className="text-center text-zinc-600 mt-20 flex flex-col items-center">
                      <Terminal size={48} className="mb-4 opacity-20"/>
                      <div className="text-xs font-mono tracking-widest">NO ACTIVE MISSION DATA FOUND</div>
                      <div className="text-[10px] mt-2 opacity-50">Initialize from Prediction Terminal</div>
                   </div>
                 )}
               </div>
             )}

          </div>

          {/* INPUT FIELD (Chat only) */}
          {activeTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-black">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 opacity-50 group-hover:opacity-100 group-hover:from-amber-500/50 group-hover:to-zinc-700 transition duration-500 blur-[1px]"></div>
                <div className="relative flex items-center bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700">
                  <span className="pl-3 text-amber-500 animate-pulse">{'>'}</span>
                  <input 
                    type="text" 
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="TRANSMIT DATA..." 
                    className="w-full bg-transparent p-3 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono uppercase"
                  />
                  <button type="submit" className="p-3 text-zinc-500 hover:text-amber-500 transition-colors">
                    <Zap size={14} />
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};