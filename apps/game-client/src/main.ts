type World = "light" | "shadow";
type Vec2 = { x: number; y: number };

// --- Configuration ---
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    colors: {
        light: { primary: "#00d2ff", secondary: "#005f7f", text: "#ffffff" },
        shadow: { primary: "#b026ff", secondary: "#4a0072", text: "#ffffff" }
    },
    // Character Visual Settings
    character: {
        width: 64,  
        height: 64, 
        scale: 1.5  
    },
    // Gameplay Timing
    gameplay: {
        attackDuration: 300 
    }
};

interface PowerUp {
  x: number; y: number; world: World;
  type: "speed" | "heal" | "shield" | "damage" | "invisibility" | "slow_trap";
  activeUntil: number;
}

const GameStats = {
    matchStartTime: 0, playerWorldShifts: 0, botWorldShifts: 0,
    playerHitsLanded: 0, botHitsLanded: 0, playerDeaths: 0, botDeaths: 0,
};

const Desync = { level: 0, decayRate: 0.5, gainRate: 5 };

declare global {
  interface Window { GameClient?: any; Tone?: any; }
}

/* -------------------------------------------------------
  Asset Loader
------------------------------------------------------- */
const sprites = {
    character: new Image(),
    bgLight: new Image(),  // NEW
    bgShadow: new Image()  // NEW
};

// Load Assets
sprites.character.src = "/assets/knight/Character.png"; 
sprites.bgLight.src = "/assets/cave_bg.jpg";    // Ensure this file exists
sprites.bgShadow.src = "/assets/space_bg.jpg";  // Ensure this file exists

// Load Font
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

/* -------------------------------------------------------
  Utility & Audio
------------------------------------------------------- */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

let shakeMagnitude = 0;
function applyShake(magnitude: number, durationMs: number) {
    shakeMagnitude = Math.max(shakeMagnitude, magnitude);
    setTimeout(() => { shakeMagnitude = 0; }, durationMs);
}

let hitSynth: any, swingSynth: any;
function initAudio() {
    if (window.Tone) {
        try {
            hitSynth = new window.Tone.MetalSynth({
                envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
                harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
            }).toDestination();
            swingSynth = new window.Tone.NoiseSynth({ 
                noise: { type: 'white' }, 
                envelope: { attack: 0.001, decay: 0.1, sustain: 0 } 
            }).toDestination();
        } catch (e) {}
    }
}

function playSound(type: 'hit' | 'swing') {
    if (window.Tone) {
        try {
            if (type === 'hit') hitSynth.triggerAttackRelease("32n");
            else if (type === 'swing') swingSynth.triggerAttackRelease("16n");
        } catch (e) {}
    }
}

/* -------------------------------------------------------
  Main Entry
------------------------------------------------------- */
function startGame(canvas: HTMLCanvasElement) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;

  const toneScript = document.createElement("script");
  toneScript.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js";
  toneScript.onload = initAudio;
  document.body.appendChild(toneScript);

  GameStats.matchStartTime = Date.now();

  // --- Entities ---
  const player = {
    x: 200, y: 300, vx: 0, vy: 0, speed: 220, world: "light" as World,
    hp: 100, maxHp: 100, lastShift: 0, dashCooldown: 3000, deadUntil: 0,
    shieldUntil: 0, speedBoostUntil: 0, damageBoostUntil: 0, invisibleUntil: 0,
    baseDamage: 10, currentDamage: 10, isSlowedUntil: 0,
    facingRight: true,
    isAttacking: false,
    attackTimer: 0,
    attackCooldown: 0
  };

  const bot = {
    x: 600, y: 300, vx: 0, vy: 0, world: "shadow" as World,
    hp: 100, maxHp: 100, decisionCooldown: 0,
    facingRight: false,
    isAttacking: false,
    attackTimer: 0,
    attackCooldown: 0
  };

  const obstacles: { x: number; y: number; w: number; h: number; world?: World }[] = [
    { x: 300, y: 200, w: 80, h: 20 }, { x: 450, y: 350, w: 120, h: 25 },
    { x: 100, y: 100, w: 30, h: 150, world: "shadow" }, { x: 650, y: 50, w: 150, h: 30, world: "shadow" }, 
    { x: 150, y: 400, w: 100, h: 30, world: "light" }, { x: 500, y: 100, w: 30, h: 100, world: "light" }, 
  ];

  const powerups: PowerUp[] = [];
  let powerupSpawnCooldown = 0; 
  const particles: any[] = [];
  const keys = new Set<string>();
  const mouse = { x: 0, y: 0 };

  window.addEventListener("keydown", (e) => {
    keys.add(e.key.toLowerCase());
    if (e.code === "Space") {
      const now = Date.now();
      const shiftPenalty = Desync.level > 50 ? 2 : 1; 
      if (now - player.lastShift >= player.dashCooldown * shiftPenalty) {
        player.world = player.world === "light" ? "shadow" : "light";
        player.lastShift = now;
        GameStats.playerWorldShifts++; 
        addParticles(player.x, player.y, player.world === "light" ? "#00d2ff" : "#b026ff", 30, 3);
        applyShake(5, 150); 
      }
    }
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
  });
  window.addEventListener("mousedown", () => {
    if (player.deadUntil || player.attackCooldown > 0) return;
    player.isAttacking = true;
    player.attackCooldown = 400;
    player.attackTimer = CONFIG.gameplay.attackDuration; 
    playSound('swing');
    checkMeleeHit(player, bot);
  });

  function checkMeleeHit(attacker: any, defender: any) {
      if (defender.deadUntil > 0 || attacker.world !== defender.world) return;
      const d = dist(attacker, defender);
      const range = 80; 
      const isFacingTarget = (attacker.facingRight && defender.x > attacker.x) || (!attacker.facingRight && defender.x < attacker.x);
      
      if (d < range && isFacingTarget) {
          const dmg = attacker.currentDamage;
          if (defender === player && Date.now() < player.shieldUntil) {
             // Blocked
          } else {
              defender.hp -= dmg;
              applyShake(5, 100);
              addParticles(defender.x, defender.y, "#ff0000", 10, 2);
              playSound('hit');
              if (defender === bot) {
                  Desync.level = Math.min(100, Desync.level + Desync.gainRate);
                  GameStats.playerHitsLanded++;
              }
          }
      }
  }

  function collides(x: number, y: number, w: number, h: number, targetWorld: World) {
    return obstacles.some((o) => {
        const existsInTargetWorld = !o.world || o.world === targetWorld;
        if (!existsInTargetWorld) return false;
        return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y;
    });
  }

  function spawnPowerUp() {
    const world: World = Math.random() < 0.5 ? "light" : "shadow";
    const x = rand(50, canvas.width - 50);
    const y = rand(50, canvas.height - 50);
    const types: PowerUp["type"][] = world === "light" ? ["speed", "heal", "shield"] : ["damage", "invisibility", "slow_trap"];
    const type = types[Math.floor(Math.random() * types.length)];
    if (!powerups.some(p => dist({x,y}, p) < 50) && !collides(x, y, 10, 10, world)) {
        powerups.push({ x, y, world, type, activeUntil: 0 });
    }
  }

  function addParticles(x: number, y: number, color: string, count = 16, speed = 1) {
    for (let i = 0; i < count; i++) {
      particles.push({ x, y, vx: rand(-2, 2) * speed, vy: rand(-2, 2) * speed, life: rand(200, 400), color });
    }
  }

  // --- Game Loop ---
  let lastTime = performance.now();
  function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    Desync.level = Math.max(0, Desync.level - Desync.decayRate * dt * 10);
    
    // Player Logic
    player.currentDamage = Date.now() < player.damageBoostUntil ? player.baseDamage * 2 : player.baseDamage;
    const currentSpeed = player.speed * (Date.now() < player.speedBoostUntil ? 1.5 : 1) * (Date.now() < player.isSlowedUntil ? 0.5 : 1);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt * 1000);
    
    let ax = 0, ay = 0;
    if (!player.isAttacking) { 
        if (keys.has("w")) ay -= 1; if (keys.has("s")) ay += 1;
        if (keys.has("a")) ax -= 1; if (keys.has("d")) ax += 1;
    }
    const len = Math.hypot(ax, ay) || 1;
    player.vx = (ax / len) * currentSpeed * dt; 
    player.vy = (ay / len) * currentSpeed * dt; 
    
    if (player.isAttacking) {
        player.attackTimer -= dt * 1000;
        if (player.attackTimer <= 0) player.isAttacking = false;
    }

    if (mouse.x > player.x) player.facingRight = true; else player.facingRight = false;

    const nextX = player.x + player.vx * 60 * dt;
    const nextY = player.y + player.vy * 60 * dt;
    if (!collides(nextX - 15, player.y - 15, 30, 30, player.world)) player.x = nextX;
    if (!collides(player.x - 15, nextY - 15, 30, 30, player.world)) player.y = nextY;

    // Spawners
    powerupSpawnCooldown -= dt * 1000;
    if (powerupSpawnCooldown <= 0 && powerups.length < 5) { spawnPowerUp(); powerupSpawnCooldown = rand(2000, 5000); }

    // Bot AI
    if (bot.hp > 0) {
        bot.attackCooldown = Math.max(0, bot.attackCooldown - dt * 1000);

        if (!bot.isAttacking) {
            bot.decisionCooldown -= dt * 1000;
            if (bot.decisionCooldown <= 0) {
                bot.decisionCooldown = 300;
                const d = dist(player, bot);
                
                if (d > 50) { // Chase
                    bot.vx = (player.x - bot.x) * 0.015; 
                    bot.vy = (player.y - bot.y) * 0.015;
                } else { // Attack
                    bot.vx = 0; bot.vy = 0;
                    if (bot.attackCooldown <= 0 && player.world === bot.world && Date.now() > player.invisibleUntil) {
                        bot.isAttacking = true;
                        bot.attackCooldown = 1000;
                        bot.attackTimer = CONFIG.gameplay.attackDuration;
                        playSound('swing');
                        setTimeout(() => checkMeleeHit(bot, player), 200);
                    }
                }

                if (player.world !== bot.world && d < 400 && Math.random() < 0.05) {
                    bot.world = bot.world === "light" ? "shadow" : "light";
                    GameStats.botWorldShifts++;
                    addParticles(bot.x, bot.y, bot.world === "light" ? CONFIG.colors.light.primary : CONFIG.colors.shadow.primary, 20, 2);
                }
            }
        
            const bNextX = bot.x + bot.vx * dt * 60;
            const bNextY = bot.y + bot.vy * dt * 60;
            if (!collides(bNextX - 15, bNextY - 15, 30, 30, bot.world)) { bot.x = bNextX; bot.y = bNextY; }
        }

        if (bot.isAttacking) {
             bot.attackTimer -= dt * 1000;
             if (bot.attackTimer <= 0) bot.isAttacking = false;
        }
        if (player.x > bot.x) bot.facingRight = true; else bot.facingRight = false;
    }

    // Powerups & Respawn
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (dist(p, player) < 30 && p.world === player.world) {
            if (p.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + 25);
            else if (p.type === 'speed') player.speedBoostUntil = now + 3000;
            else if (p.type === 'shield') player.shieldUntil = now + 3000;
            else if (p.type === 'damage') player.damageBoostUntil = now + 3000;
            else if (p.type === 'invisibility') player.invisibleUntil = now + 2000;
            else if (p.type === 'slow_trap') player.isSlowedUntil = now + 3000;
            powerups.splice(i, 1); 
        }
    }
    if (player.hp <= 0 && !player.deadUntil) { player.deadUntil = now + 2000; GameStats.botDeaths++; }
    if (player.deadUntil && now > player.deadUntil) { player.deadUntil = 0; player.hp = player.maxHp; player.x = 200; player.y = 300; }
    if (bot.hp <= 0) { bot.hp = bot.maxHp; bot.x = 600; bot.y = 300; GameStats.playerDeaths++; }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 16;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // --- RENDER ---
    const shakeX = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;
    const shakeY = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;
    ctx.save(); ctx.translate(shakeX, shakeY);

    drawBackground(ctx, player.world, canvas.width, canvas.height, Desync.level);
    obstacles.forEach(o => { if(!o.world || o.world === player.world) drawSciFiObstacle(ctx, o, player.world); });
    powerups.forEach(p => { if(p.world === player.world) drawSciFiPowerup(ctx, p); });

    // Draw Characters
    if (!player.deadUntil && (player.world === "light" || Date.now() > player.invisibleUntil)) {
        drawCharacter(ctx, player, player.world === "light" ? CONFIG.colors.light.primary : CONFIG.colors.shadow.primary);
    }
    if (bot.hp > 0 && bot.world === player.world) {
        drawCharacter(ctx, bot, bot.world === "light" ? CONFIG.colors.light.primary : CONFIG.colors.shadow.primary);
    }

    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / 400); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    drawLightingSystem(ctx, player, canvas.width, canvas.height);
    ctx.restore();

    drawSciFiHUD(ctx, player, Desync.level, canvas.width, canvas.height);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* -------------------------------------------------------
  RENDERERS
------------------------------------------------------- */

function drawCharacter(ctx: CanvasRenderingContext2D, entity: any, tintColor: string) {
    const img = sprites.character;
    if (!img.complete) return;

    ctx.save();
    ctx.translate(entity.x, entity.y);
    
    if (!entity.facingRight) ctx.scale(-1, 1);
    
    // Team Indicator
    ctx.save();
    ctx.translate(0, CONFIG.character.height/2); 
    ctx.scale(1, 0.3); 
    ctx.strokeStyle = tintColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
    
    // Draw Character
    const w = CONFIG.character.width * CONFIG.character.scale;
    const h = CONFIG.character.height * CONFIG.character.scale;
    
    if (entity.isAttacking) ctx.rotate(entity.facingRight ? 0.2 : -0.2);

    ctx.drawImage(img, -w/2, -h/2, w, h);
    
    ctx.restore();

    // HP Bar
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(entity.x - 20, entity.y - 50, 40, 5);
    ctx.fillStyle = "#00ff00"; ctx.fillRect(entity.x - 20, entity.y - 50, 40 * (entity.hp / 100), 5);
}

function drawBackground(ctx: CanvasRenderingContext2D, world: World, w: number, h: number, desync: number) {
    const img = world === "light" ? sprites.bgLight : sprites.bgShadow;

    // If Image Loaded, use it
    if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, w, h);
    } else {
        // Fallback Gradient
        const grd = ctx.createRadialGradient(w/2, h/2, 100, w/2, h/2, w);
        if (world === "light") {
            grd.addColorStop(0, "#001a33"); grd.addColorStop(1, "#000000");
        } else {
            grd.addColorStop(0, "#1a0033"); grd.addColorStop(1, "#000000");
        }
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    }

    if (desync > 50) { 
        ctx.fillStyle = `rgba(255, 0, 255, ${ (desync-50)/500 })`; 
        ctx.fillRect(0, 0, w, h); 
    }
}

function drawSciFiObstacle(ctx: CanvasRenderingContext2D, o: any, world: World) {
    const color = world === "light" ? CONFIG.colors.light.secondary : CONFIG.colors.shadow.secondary;
    const stroke = world === "light" ? CONFIG.colors.light.primary : CONFIG.colors.shadow.primary;
    ctx.fillStyle = color; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = stroke; ctx.globalAlpha = 0.2; ctx.fillRect(o.x + 5, o.y + 5, o.w - 10, o.h - 10); ctx.globalAlpha = 1;
}

function drawSciFiPowerup(ctx: CanvasRenderingContext2D, p: any) {
    const colors: Record<string, string> = { "speed": "#ffaa00", "heal": "#00ff00", "shield": "#00ffff", "damage": "#ff0000", "invisibility": "#aa00ff", "slow_trap": "#555" };
    const c = colors[p.type] || "#fff";
    ctx.save(); ctx.translate(p.x, p.y); const bob = Math.sin(Date.now() / 200) * 3;
    ctx.shadowBlur = 10; ctx.shadowColor = c; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0 + bob, 12, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = c; ctx.font = "14px Rajdhani"; ctx.textAlign = "center"; ctx.fillText(p.type[0].toUpperCase(), 0, 5 + bob); ctx.restore();
}

function drawLightingSystem(ctx: CanvasRenderingContext2D, player: any, w: number, h: number) {
    // 1. Determine how dark the world should be
    // Shadow world is very dark (0.95), Light world is slightly dim (0.2)
    const maxDarkness = player.world === "shadow" ? 0.95 : 0.2;
    
    // 2. Create a "Flashlight" Gradient
    // It starts at the player coordinates
    // Inner Radius (80px): Transparent (Clear view of character)
    // Outer Radius (600px): Pitch Black (Hidden)
    const grd = ctx.createRadialGradient(
        player.x, player.y, 80,   // Start clear circle
        player.x, player.y, 600   // End dark circle
    );
    
    // 3. Define the colors
    grd.addColorStop(0, "rgba(0,0,0,0)");           // Center: 100% Transparent
    grd.addColorStop(0.1, `rgba(0,0,0,${maxDarkness * 0.1})`); // Soft edge
    grd.addColorStop(1, `rgba(0,0,0,${maxDarkness})`);         // Outside: Dark

    // 4. Draw the gradient over the whole screen
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    
    // 5. Draw extra "black bars" for areas outside the gradient range
    // This ensures corners are dark if the screen is large
    ctx.fillStyle = `rgba(0,0,0,${maxDarkness})`;
    
    // Only fill the area *outside* our large 600px radius to save performance
    // (Optional, but keeps the "Deep Darkness" feel in large windows)
}

function drawSciFiHUD(ctx: CanvasRenderingContext2D, player: any, desync: number, w: number, h: number) {
    ctx.font = "20px Rajdhani"; ctx.fillStyle = CONFIG.colors.light.text;
    const hpPct = Math.max(0, player.hp / 100);
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.beginPath(); ctx.roundRect(20, 20, 200, 20, 5); ctx.fill();
    ctx.fillStyle = hpPct > 0.5 ? "#00ff00" : "#ff0000"; ctx.beginPath(); ctx.roundRect(20, 20, 200 * hpPct, 20, 5); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(20, 20, 200, 20, 5); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillText("HP", 25, 37);

    const desyncPct = desync / 100;
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.beginPath(); ctx.roundRect(w - 220, 20, 200, 20, 5); ctx.fill();
    ctx.fillStyle = `rgb(${255 * desyncPct}, ${255 * (1-desyncPct)}, 0)`; ctx.beginPath(); ctx.roundRect(w - 220, 20, 200 * desyncPct, 20, 5); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.roundRect(w - 220, 20, 200, 20, 5); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.fillText("DESYNC", w - 25, 37);
    ctx.textAlign = "left";
}

window.GameClient = { startGame };
export {};