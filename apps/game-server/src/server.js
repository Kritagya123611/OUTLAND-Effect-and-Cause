import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Initialize App
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// --- GLOBAL STATE (In Memory) ---
// In production, use Redis for this
let slots = [
  { id: 0, status: 'empty' },
  { id: 1, status: 'empty' },
  { id: 2, status: 'empty' },
  { id: 3, status: 'empty' },
];

let chatHistory = [];

// --- HELPER: MOCK VIDEO TOKEN GENERATION ---
// In a real app, import 'livekit-server-sdk' and generate a real token here
const generateVideoToken = (roomName, participantName) => {
  console.log(`Generating token for ${participantName} in ${roomName}`);
  return "mock_token_eyJh..."; 
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. Send initial state to the new user
  socket.emit('state_update', slots);
  socket.emit('chat_history', chatHistory);

  // 2. Handle "Start Streaming" Request
  socket.on('claim_slot', ({ slotId, username }) => {
    // Validation
    if (slots[slotId].status !== 'empty') {
      return socket.emit('error', 'Slot already taken');
    }

    // Update State
    slots[slotId] = {
      id: slotId,
      status: 'live',
      user: username,
      viewers: 0,
      socketId: socket.id // Track who owns the slot
    };

    // Generate Video Token for the user
    const token = generateVideoToken('arena-1', username);

    // Tell the user they succeeded and give them the token
    socket.emit('slot_claimed', { slotId, token });

    // Broadcast new state to EVERYONE else
    io.emit('state_update', slots);
    
    // System Message
    const sysMsg = { user: 'SYSTEM', text: `${username} has entered the arena!`, type: 'system' };
    chatHistory.push(sysMsg);
    io.emit('chat_message', sysMsg);
  });

  // 3. Handle Leaving / Disconnecting
  const handleLeave = () => {
    // Find if this socket occupied a slot
    const slotIndex = slots.findIndex(s => s.socketId === socket.id);
    
    if (slotIndex !== -1) {
      const username = slots[slotIndex].user;
      
      // Reset the slot
      slots[slotIndex] = { id: slotIndex, status: 'empty' };
      
      // Notify everyone
      io.emit('state_update', slots);
      io.emit('chat_message', { user: 'SYSTEM', text: `${username} disconnected.`, type: 'system' });
    }
  };

  socket.on('leave_slot', handleLeave);
  socket.on('disconnect', handleLeave);

  // 4. Handle Chat
  socket.on('send_message', (msg) => {
    // Sanitize and broadcast
    const newMsg = { ...msg, timestamp: Date.now() };
    chatHistory.push(newMsg);
    if (chatHistory.length > 50) chatHistory.shift(); // Keep history short
    io.emit('chat_message', newMsg);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});