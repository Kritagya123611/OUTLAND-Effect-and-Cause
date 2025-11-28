import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// --- IN-MEMORY DATABASE ---
let globalState = {
  players: {}, // Stores { socketId: { username, loadout, prediction, wallet } }
  marketPool: 0 // Total SOL bet
};

io.on('connection', (socket) => {
  console.log(`[UPLINK ESTABLISHED] :: ID ${socket.id}`);

  // 1. HANDLE LOADOUT SELECTION
  socket.on('select_loadout', (data) => {
    const player = globalState.players[socket.id] || { username: `OPERATOR_${socket.id.slice(0,3)}` };
    
    globalState.players[socket.id] = {
      ...player,
      tier: data.tierId,
      wager: data.betAmount,
      status: 'ARMED'
    };

    console.log(`[ARMORY] Player ${socket.id.slice(0,4)} selected TIER ${data.tierId}`);
    socket.emit('loadout_confirmed', { success: true });
  });

  // 2. HANDLE PREDICTION LOCK
  socket.on('lock_prediction', (data) => {
    const player = globalState.players[socket.id] || {};

    globalState.players[socket.id] = {
      ...player,
      prediction: data.kills,
      payout: data.potentialPayout,
      status: 'READY_TO_DEPLOY'
    };

    globalState.marketPool += parseFloat(player.wager || 0);

    // Broadcast this huge bet to EVERYONE (Hype factor for judges)
    io.emit('chat_message', {
      user: 'SYSTEM',
      text: `NEW CHALLENGER: ${player.username || 'UNK'} WAGERED ${player.wager} SOL ON ${data.kills} KILLS`,
      type: 'system'
    });

    console.log(`[PREDICTION] Player ${socket.id.slice(0,4)} locked: ${data.kills} Kills`);
    socket.emit('prediction_locked', { success: true });
  });

  // 3. FETCH SESSION DATA (New for UI Display)
  socket.on('get_session_data', () => {
    const player = globalState.players[socket.id];
    if (player) {
      socket.emit('session_data', player);
    }
  });

  // 4. STREAMING LOGIC
  let slots = [
    { id: 0, status: 'empty' }, { id: 1, status: 'empty' }, 
    { id: 2, status: 'empty' }, { id: 3, status: 'empty' }
  ];

  socket.emit('state_update', slots);

  socket.on('claim_slot', ({ slotId, username }) => {
    if (slots[slotId].status !== 'empty') return;
    
    // Update the slot
    slots[slotId] = { id: slotId, status: 'live', user: username, viewers: 0, socketId: socket.id };
    
    // Update player status
    if(globalState.players[socket.id]) {
        globalState.players[socket.id].status = 'LIVE_BROADCAST';
    }

    io.emit('state_update', slots);
    console.log(`[STREAM] ${username} is LIVE on Slot ${slotId}`);
  });

  // 5. CHAT
  socket.on('send_message', (data) => {
    io.emit('chat_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`[UPLINK LOST] :: ID ${socket.id}`);
    delete globalState.players[socket.id];
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`>> TACTICAL SERVER OPERATIONAL ON PORT ${PORT}`);
});