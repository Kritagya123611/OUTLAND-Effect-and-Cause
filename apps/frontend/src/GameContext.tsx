import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the full player state shape
export interface PlayerState {
  id: string;
  walletAddress: string;
  balance: number;
  username: string;
  loadout: any;
  activeWager: {
    kills: number;
    betAmount: number;
    potentialPayout: string;
    status: string;
  } | null;
}

interface GameContextType {
  socket: Socket | null;
  player: PlayerState | null;
  isConnected: boolean;
  login: () => void;
  selectLoadout: (loadout: any) => void;
  placeBet: (kills: number, amount: number, payout: string) => void;
  reportResult: (actualKills: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

// Initialize socket outside to prevent re-connections
const socket = io('http://localhost:3001');

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    // The server is the source of truth. When it sends 'sync_state', we update React.
    socket.on('sync_state', (data: PlayerState) => {
        console.log("State Synced:", data);
        setPlayer(data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('sync_state');
    };
  }, []);

  // --- ACTIONS ---

  const login = () => {
    // Simulate wallet signature & login
    const mockWallet = `0x${Math.random().toString(16).slice(2, 10)}...`;
    socket.emit('login', { walletAddress: mockWallet });
  };

  const selectLoadout = (loadout: any) => {
    socket.emit('select_loadout', loadout);
  };

  const placeBet = (kills: number, amount: number, payout: string) => {
    socket.emit('lock_wager', { 
        kills, 
        betAmount: amount, 
        potentialPayout: payout 
    });
  };

  const reportResult = (actualKills: number) => {
      socket.emit('admin_report_result', { actualKills });
  };

  return (
    <GameContext.Provider value={{ 
        socket, 
        player, 
        isConnected, 
        login, 
        selectLoadout, 
        placeBet, 
        reportResult 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};