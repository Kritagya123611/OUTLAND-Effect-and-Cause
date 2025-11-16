/*import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface PlayerState {
  id: string;
  x: number;
  y: number;
  world: "light" | "shadow";
}

const players: Record<string, PlayerState> = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2);
  players[id] = { id, x: 100, y: 100, world: "light" };

  ws.send(JSON.stringify({ type: "id", id }));

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());

    if (msg.type === "input") {
      const p = players[id];
      if (!p) return;
      p.x = msg.x;
      p.y = msg.y;
      p.world = msg.world;
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

// broadcast loop 30 FPS
setInterval(() => {
  const snapshot = Object.values(players);
  wss.clients.forEach((client: any) =>
    client.send(JSON.stringify({ type: "state", players: snapshot }))
  );
}, 33);

console.log("Game server running on ws://localhost:8080");
*/
