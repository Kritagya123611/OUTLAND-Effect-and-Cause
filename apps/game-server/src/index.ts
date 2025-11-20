import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log("🚀 Parallel Worlds Game Server started on port 8080");

// --- Types ---
type World = "light" | "shadow";

interface Player {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    world: World;
    hp: number;
    maxHp: number;
    ws: any;
    keys: { w: boolean; a: boolean; s: boolean; d: boolean };
    lastShift: number;
    deadUntil: number;
}

interface Bullet {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    ownerId: string;
    world: World;
}

// --- Game State ---
const players: Record<string, Player> = {};
let bullets: Bullet[] = [];
let desyncLevel = 0;
let obstacles = [
    { x: 300, y: 200, w: 80, h: 20 },
    { x: 450, y: 350, w: 120, h: 25 },
    { x: 100, y: 100, w: 30, h: 150, world: "shadow" }, 
    { x: 650, y: 50, w: 150, h: 30, world: "shadow" }, 
    { x: 150, y: 400, w: 100, h: 30, world: "light" }, 
    { x: 500, y: 100, w: 30, h: 100, world: "light" }, 
];

// --- Helpers ---
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function collides(x: number, y: number, w: number, h: number, targetWorld: string) {
    return obstacles.some((o: any) => {
        const existsInTargetWorld = !o.world || o.world === targetWorld;
        if (!existsInTargetWorld) return false;
        return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y;
    });
}

// --- Connection Handling ---
wss.on('connection', (ws) => {
    const id = generateId();
    console.log(`Player connected: ${id}`);

    // Initialize Player
    players[id] = {
        id,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        vx: 0, vy: 0, angle: 0,
        world: 'light',
        hp: 100, maxHp: 100,
        ws,
        keys: { w: false, a: false, s: false, d: false },
        lastShift: 0,
        deadUntil: 0
    };

    // Send Init Packet
    ws.send(JSON.stringify({ type: 'init', id }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            const p = players[id];
            if (!p) return;

            if (data.type === 'input') {
                p.keys = data.keys;
                p.angle = data.angle;
            }
            
            if (data.type === 'shift') {
                const now = Date.now();
                if (now - p.lastShift > 3000) {
                    p.world = p.world === 'light' ? 'shadow' : 'light';
                    p.lastShift = now;
                }
            }

            if (data.type === 'shoot') {
                if (p.deadUntil > 0) return;
                bullets.push({
                    id: generateId(),
                    x: p.x + Math.cos(p.angle) * 20,
                    y: p.y + Math.sin(p.angle) * 20,
                    vx: Math.cos(p.angle) * 8,
                    vy: Math.sin(p.angle) * 8,
                    ownerId: id,
                    world: p.world
                });
            }

        } catch (e) { console.error(e); }
    });

    ws.on('close', () => {
        console.log(`Player disconnected: ${id}`);
        delete players[id];
    });
});

// --- Game Loop (60 FPS) ---
setInterval(() => {
    const now = Date.now();

    // Update Players
    for (const id in players) {
        const p = players[id];
        if (!p) continue;
        
        // Respawn Logic
        if (p.deadUntil > 0 && now > p.deadUntil) {
            p.deadUntil = 0;
            p.hp = 100;
            p.x = Math.random() * 700 + 50;
            p.y = Math.random() * 500 + 50;
        }
        if (p.deadUntil > 0) continue;

        // Movement Logic
        let ax = 0; let ay = 0;
        if (p.keys.w) ay -= 1;
        if (p.keys.s) ay += 1;
        if (p.keys.a) ax -= 1;
        if (p.keys.d) ax += 1;

        const len = Math.hypot(ax, ay) || 1;
        const speed = 220 * (1/60); // Speed per frame
        
        const nextX = p.x + (ax / len) * speed;
        const nextY = p.y + (ay / len) * speed;

        if (!collides(nextX - 15, p.y - 15, 30, 30, p.world) && nextX > 0 && nextX < 800) p.x = nextX;
        if (!collides(p.x - 15, nextY - 15, 30, 30, p.world) && nextY > 0 && nextY < 600) p.y = nextY;
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b) continue;
        b.x += b.vx;
        b.y += b.vy;

        // Wall/Boundaries
        if (collides(b.x, b.y, 5, 5, b.world) || b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
            bullets.splice(i, 1);
            continue;
        }

        // Player Hit
        for (const id in players) {
            const p = players[id];
            if (!p) continue;
            if (b.ownerId !== id && p.world === b.world && p.deadUntil === 0) {
                const dist = Math.hypot(p.x - b.x, p.y - b.y);
                if (dist < 20) {
                    p.hp -= 15;
                    bullets.splice(i, 1);
                    if (p.hp <= 0) {
                        p.deadUntil = now + 2000;
                        desyncLevel = Math.min(100, desyncLevel + 10);
                    }
                    break;
                }
            }
        }
    }

    // Desync Decay
    desyncLevel = Math.max(0, desyncLevel - 0.05);

    // Broadcast State
    const state = {
        players: Object.values(players).map(({ ws, ...p }) => p), // Strip WebSocket object
        bullets,
        desyncLevel
    };

    const data = JSON.stringify({ type: 'state', state });
    for (const id in players) {
        const player = players[id];
        if (player?.ws) {
            player.ws.send(data);
        }
    }

}, 1000 / 60);