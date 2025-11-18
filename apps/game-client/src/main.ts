type World = "light" | "shadow";
type Vec2 = { x: number; y: number };

// Interface definition for PowerUp
interface PowerUp {
  x: number;
  y: number;
  world: World;
  type: "speed" | "heal" | "shield" | "damage" | "invisibility" | "slow_trap";
  activeUntil: number;
}

// Match Statistics Tracker (Feature #4: On-Chain Match Record)
const GameStats = {
    matchStartTime: 0,
    playerWorldShifts: 0,
    botWorldShifts: 0,
    playerHitsLanded: 0,
    botHitsLanded: 0,
    playerDeaths: 0,
    botDeaths: 0,
};

// Desync State (Feature #7: World Desync Mechanic)
const Desync = {
    level: 0, // 0 to 100
    decayRate: 0.5, // How fast desync falls per second
    gainRate: 5,    // Desync gained per successful hit
};

// Global Window for client entry and Tone.js
declare global {
  interface Window {
    GameClient?: any;
    Tone?: any;
  }
}

/* -------------------------------------------------------
  Utility
------------------------------------------------------- */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

// Screen Shake Utility (Feature #11)
let shakeMagnitude = 0;

function applyShake(magnitude: number, durationMs: number) {
    shakeMagnitude = Math.max(shakeMagnitude, magnitude);
    setTimeout(() => {
        shakeMagnitude = 0;
    }, durationMs);
}

// Sound Effects Initialization (Feature #14)
let shiftSynth: any;
let hitSynth: any;

function initAudio() {
    if (window.Tone) {
        // Shift sound: dramatic "whoosh"
        shiftSynth = new window.Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
        }).toDestination();

        // Hit sound: sharp, percussive sound
        hitSynth = new window.Tone.MembraneSynth().toDestination();
    }
}

function playSound(type: 'shift' | 'hit', note?: string) {
    if (window.Tone) {
        try {
            if (type === 'shift') {
                shiftSynth.triggerAttackRelease("8n");
            } else if (type === 'hit') {
                hitSynth.triggerAttackRelease(note || "C4", "16n");
            }
        } catch (e) {
            // Tone.js might fail if audio context isn't running. Ignore in production.
        }
    }
}

/* -------------------------------------------------------
  Main Entry
------------------------------------------------------- */
function startGame(canvas: HTMLCanvasElement) {
    // NEW: Background images for each world
const bgLight = new Image();
bgLight.src = "/assets/cave_bg.jpg";   // put your file path

const bgShadow = new Image();
bgShadow.src = "/assets/space_bg.jpg"; // put your file path

function drawBackground(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    world: World,
    desyncLevel: number
) {
    const img = world === "light" ? bgLight : bgShadow;

    if (img.complete) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }

    if (desyncLevel > 70) {
        ctx.fillStyle = `rgba(255, 0, 255, ${(desyncLevel / 100) * 0.15})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}


  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = 800;
  canvas.height = 600;

  // Load Tone.js for audio (Feature #14)
  const toneScript = document.createElement("script");
  toneScript.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js";
  toneScript.onload = initAudio;
  document.body.appendChild(toneScript);

  GameStats.matchStartTime = Date.now(); // Start match timer

  // Particle trail color definitions
  const particleColors = {
      light: { primary: "#fff6d1", trail: "#ffff00" }, // Light: Space/White
      shadow: { primary: "#b9a7ff", trail: "#ff00ff" } // Shadow: Caverns/Purple
  };


  /* -------------------------------------------------------
    PLAYER / BOT / OBSTACLES (State Initialization)
  ------------------------------------------------------- */
  const player = {
    x: 200, y: 300, vx: 0, vy: 0, speed: 220, world: "light" as World,
    hp: 100, maxHp: 100, lastShift: 0, dashCooldown: 3000, deadUntil: 0,
    shieldUntil: 0, speedBoostUntil: 0, damageBoostUntil: 0, invisibleUntil: 0,
    baseDamage: 15, currentDamage: 15, isSlowedUntil: 0,
  };

  const bot = {
    x: 600, y: 300, vx: 0, vy: 0, world: "shadow" as World,
    hp: 100, maxHp: 100, fireCooldown: 0, decisionCooldown: 0,
  };

  const obstacles: { x: number; y: number; w: number; h: number; world?: World }[] = [
    { x: 300, y: 200, w: 80, h: 20 },
    { x: 450, y: 350, w: 120, h: 25 },
    { x: 100, y: 100, w: 30, h: 150, world: "shadow" }, 
    { x: 650, y: 50, w: 150, h: 30, world: "shadow" }, 
    { x: 150, y: 400, w: 100, h: 30, world: "light" }, 
    { x: 500, y: 100, w: 30, h: 100, world: "light" }, 
  ];

  function collides(x: number, y: number, w: number, h: number, targetWorld: World) {
    return obstacles.some((o) => {
        const existsInTargetWorld = !o.world || o.world === targetWorld;
        if (!existsInTargetWorld) return false;
        return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y;
    });
  }

  // Powerup state and logic
  const powerups: PowerUp[] = [];
  let powerupSpawnCooldown = 0; 
  function spawnPowerUp() {
    const world: World = Math.random() < 0.5 ? "light" : "shadow";
    const x = rand(50, canvas.width - 50);
    const y = rand(50, canvas.height - 50);

    let type: PowerUp["type"];
    if (world === "light") {
        const types: PowerUp["type"][] = ["speed", "heal", "shield"];
        type = types[Math.floor(Math.random() * types.length)];
    } else {
        const types: PowerUp["type"][] = ["damage", "invisibility", "slow_trap"];
        type = types[Math.floor(Math.random() * types.length)];
    }

    if (powerups.some(p => dist({x,y}, p) < 50) || collides(x, y, 10, 10, world)) {
        return;
    }
    powerups.push({ x, y, world, type, activeUntil: 0 });
  }

  // Particle state
  const particles: any[] = [];
  function addParticles(x: number, y: number, color: string, count = 16) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: rand(-2, 2),
        vy: rand(-2, 2),
        life: rand(150, 300),
        color,
      });
    }
  }

  // Bullet state and logic
  const bullets: any[] = [];
  function fireBullet(src: typeof player | typeof bot) {
    const dmg = src === player ? player.currentDamage : 15;
    const b = {
      x: src.x, y: src.y,
      vx: (src === player ? 1 : -1) * 5,
      vy: rand(-0.8, 0.8),
      world: src.world,
      dmg: dmg, 
      owner: src === player ? "player" : "bot",
    };
    bullets.push(b);
    playSound('hit', src.world === 'light' ? 'C5' : 'G4'); 
  }
  
  // Kill Feed
  const killFeed: string[] = [];
  function pushKill(msg: string) {
    killFeed.unshift(msg);
    if (killFeed.length > 5) killFeed.pop();
  }


  /* -------------------------------------------------------
    Input
  ------------------------------------------------------- */
  const keys = new Set<string>();
  window.addEventListener("keydown", (e) => {
    keys.add(e.key.toLowerCase());

    if (e.code === "Space") {
      const now = Date.now();
      const shiftPenalty = Desync.level > 50 ? 2 : 1; 
      const actualCooldown = player.dashCooldown * shiftPenalty;

      if (now - player.lastShift >= actualCooldown) {
        player.world = player.world === "light" ? "shadow" : "light";
        player.lastShift = now;
        
        GameStats.playerWorldShifts++; 

        addParticles(player.x, player.y, player.world === "light" ? "#fff6d1" : "#b9a7ff", 30);
        applyShake(5, 100); 
        playSound('shift');
      }
    }
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  window.addEventListener("mousedown", () => {
    if (player.deadUntil) return;
    fireBullet(player);
  });

  /* -------------------------------------------------------
    BOT AI LOGIC (Feature #3: SHIFT Prediction)
  ------------------------------------------------------- */
  function updateBot(dt: number) {
    if (bot.hp <= 0) return;

    if (bot.decisionCooldown <= 0) {
      bot.decisionCooldown = 600;

      const d = dist(player, bot);

      // Movement: Chase/Flee
      if (d < 200) {
        bot.vx = (bot.x - player.x) * 0.02;
        bot.vy = (bot.y - player.y) * 0.02;
      } else {
        bot.vx = (player.x - bot.x) * 0.015;
        bot.vy = (player.y - bot.y) * 0.015;
      }
      
      // Simple Collision Avoidance
      const nextX = bot.x + bot.vx * dt * 60;
      const nextY = bot.y + bot.vy * dt * 60;
      if (collides(nextX - 18, nextY - 18, 36, 36, bot.world)) {
        bot.vx *= -1; 
        bot.vy *= -1;
      }

      // Fire Logic
      if (bot.fireCooldown <= 0 && d < 450 && player.world === bot.world && Date.now() > player.invisibleUntil) {
          fireBullet(bot);
          bot.fireCooldown = 700;
      }

      // SHIFT Prediction AI
      const playerBulletCount = bullets.filter(b => b.owner === 'player' && b.world === bot.world).length;
      const playerInBotWorld = player.world === bot.world;
      const botHealthLow = bot.hp < 30;

      let shouldShift = false;

      if (playerBulletCount > 0) { shouldShift = true; } 
      else if (!playerInBotWorld && d < 400 && Math.random() < 0.6) { shouldShift = true; } 
      else if (botHealthLow && bot.world === 'light' && Math.random() < 0.8) { shouldShift = true; }
      
      if (shouldShift) {
        bot.world = bot.world === "light" ? "shadow" : "light";
        GameStats.botWorldShifts++;
      }
    }

    bot.x += bot.vx * dt * 60;
    bot.y += bot.vy * dt * 60;

    bot.decisionCooldown -= dt * 1000;
    bot.fireCooldown -= dt * 1000;
  }

  /* -------------------------------------------------------
    Main Loop
  ------------------------------------------------------- */
  let lastTime = performance.now();

  function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    /* ------------------------------
      World Desync Update (Feature #7)
    ------------------------------ */
    Desync.level = Math.max(0, Desync.level - Desync.decayRate * dt * 10); 

    if (Desync.level > 50) {
        canvas.style.filter = `hue-rotate(${rand(-2, 2)}deg) saturate(${1 + Desync.level / 200})`;
    } else {
        canvas.style.filter = 'none';
    }

    // Update effects/speed
    player.currentDamage = Date.now() < player.damageBoostUntil ? player.baseDamage * 2 : player.baseDamage;
    const isSlowed = Date.now() < player.isSlowedUntil;
    const currentSpeed = player.speed * (Date.now() < player.speedBoostUntil ? 1.5 : 1) * (isSlowed ? 0.5 : 1);
    
    // Powerup Spawning
    powerupSpawnCooldown -= dt * 1000;
    if (powerupSpawnCooldown <= 0 && powerups.length < 5) {
        spawnPowerUp();
        powerupSpawnCooldown = rand(2000, 5000);
    }

    /* ------------------------------
      Movement / Collisions / Game Logic
    ------------------------------ */
    let ax = 0, ay = 0;
    if (keys.has("w")) ay -= 1;
    if (keys.has("s")) ay += 1;
    if (keys.has("a")) ax -= 1;
    if (keys.has("d")) ax += 1;

    const len = Math.hypot(ax, ay) || 1;
    player.vx = (ax / len) * currentSpeed * dt; 
    player.vy = (ay / len) * currentSpeed * dt; 

    const nextX = player.x + player.vx * 60 * dt;
    const nextY = player.y + player.vy * 60 * dt;
    
    if (!collides(nextX - 18, player.y - 18, 36, 36, player.world)) { player.x = nextX; }
    if (!collides(player.x - 18, nextY - 18, 36, 36, player.world)) { player.y = nextY; }

    updateBot(dt);

    // Power-Up Collection Logic
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (dist(p, player) < 25 && p.world === player.world) { 
            const duration = 3000; 

            switch (p.type) {
                case "speed": player.speedBoostUntil = now + duration; break;
                case "heal": player.hp = Math.min(player.maxHp, player.hp + 25); break;
                case "shield": player.shieldUntil = now + duration; break;
                case "damage": player.damageBoostUntil = now + duration; break;
                case "invisibility": player.invisibleUntil = now + 1000; break;
                case "slow_trap": player.isSlowedUntil = now + duration; break;
            }

            addParticles(p.x, p.y, p.world === "light" ? "#fff6d1" : "#b9a7ff");
            pushKill(`Picked up ${p.type}!`);
            powerups.splice(i, 1);
        }
    }
    
    // Bullet Update Logic
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      const speedModifier = 1 + (Desync.level / 100) * rand(-0.2, 0.2); 
      b.x += b.vx * 4 * speedModifier;
      b.y += b.vy * 4 * speedModifier;

      if (b.x < 0 || b.x > canvas.width || collides(b.x - 5, b.y - 5, 10, 10, b.world)) {
        if (b.x > 0 && b.x < canvas.width) addParticles(b.x, b.y, "rgba(255,255,255,0.5)", 5);
        bullets.splice(i, 1);
        continue;
      }

      const isPlayerHit = b.owner === "bot" && player.world === b.world && dist(b, player) < 22;
      const isBotHit = b.owner === "player" && bot.world === b.world && dist(b, bot) < 22;

      if (isPlayerHit) {
        if (Date.now() > player.shieldUntil) player.hp -= b.dmg;
        else pushKill("Shield blocked damage!");
        applyShake(10, 50); 
        addParticles(player.x, player.y, "#ff8080");
        bullets.splice(i, 1);
        continue;
      }

      if (isBotHit) {
        bot.hp -= b.dmg;
        Desync.level = Math.min(100, Desync.level + Desync.gainRate); 
        GameStats.playerHitsLanded++; 
        applyShake(5, 50); 
        addParticles(bot.x, bot.y, "#80ff80");
        bullets.splice(i, 1);
        continue;
      }
    }
    
    // Booster Particle Trail
    if (Math.hypot(player.vx, player.vy) > 0.1) {
        const color = particleColors[player.world].trail;
        addParticles(player.x - player.vx * 10, player.y - player.vy * 10, color, 1);
    }
    if (Math.hypot(bot.vx, bot.vy) > 0.1) {
        const color = particleColors[bot.world].trail;
        addParticles(bot.x - bot.vx * 10, bot.y - bot.vy * 10, color, 1);
    }


    // Death/Respawn Logic
    if (player.hp <= 0 && !player.deadUntil) {
      player.deadUntil = now + 2000;
      pushKill("Bot eliminated you!");
      GameStats.botDeaths++; 
    }
    if (player.deadUntil && now > player.deadUntil) {
      player.deadUntil = 0;
      player.hp = player.maxHp;
      player.x = 200;
      player.y = 300;
      player.shieldUntil = 0;
      player.speedBoostUntil = 0;
      player.damageBoostUntil = 0;
      player.invisibleUntil = 0;
      player.isSlowedUntil = 0;
    }

    if (bot.hp <= 0) {
      pushKill("You defeated the Bot! Writing match record to Solana...");
      GameStats.playerDeaths++; 
      bot.hp = bot.maxHp;
      bot.x = 600;
      bot.y = 300;
    }

    // Particle cleanup
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 16;
      if (p.life <= 0) particles.splice(i, 1);
    }

    /* ------------------------------
      RENDER
    ------------------------------ */
    const shakeX = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;
    const shakeY = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;
    
    // Draw Dynamic Background (Feature #12)
    drawBackground(ctx, canvas, player.world, Desync.level);

    // draw obstacles
    obstacles.forEach((o) => {
        if (!o.world || o.world === player.world) {
            drawObstacle(ctx, o, player.world, Desync.level, shakeX, shakeY);
        }
    });

    // draw powerups
    powerups.forEach((p) => {
        if (p.world === player.world) {
            drawPowerUp(ctx, p, shakeX, shakeY);
        }
    });

    // draw bullets
    bullets.forEach((b) => {
        if (b.world === player.world) {
            drawBullet(ctx, b, shakeX, shakeY);
        }
    });

    // draw entities
    const playerColor = particleColors.light.primary;
    const botColor = particleColors.shadow.primary;

    if (Date.now() > player.invisibleUntil) {
        drawEntity(ctx, player, playerColor, Date.now() < player.shieldUntil, Date.now() < player.speedBoostUntil, shakeX, shakeY);
    } else {
        drawEntity(ctx, player, "rgba(255, 255, 255, 0.2)", false, false, shakeX, shakeY);
    }
    
    if (bot.world === player.world) {
        drawEntity(ctx, bot, botColor, false, false, shakeX, shakeY);
    }
    
    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0.1, p.life / 300);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + shakeX, p.y + shakeY, 3, 3);
    });
    ctx.globalAlpha = 1;

    // HUD / Status text
    drawHUD(ctx, player, canvas, Desync.level); 

    // kill feed
    ctx.font = "14px Inter";
    ctx.fillStyle = "#fff";
    for (let i = 0; i < killFeed.length; i++) {
      ctx.fillText(killFeed[i], 12, 22 + i * 18);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

/* -------------------------------------------------------
  NEW: Custom Drawing Functions (Max Polish)
------------------------------------------------------- */


// Draws an entity with better detail (Robot)
function drawEntity(ctx: CanvasRenderingContext2D, e: any, color: string, isShielded: boolean, isBoosted: boolean, shakeX: number, shakeY: number) {
  const x = e.x + shakeX;
  const y = e.y + shakeY;
  const size = 18;
  const isFacingRight = e.vx > 0; // Direction based on velocity

  // --- Robot Body (Rectangle for better robot look) ---
  ctx.fillStyle = color;
  ctx.beginPath();
  // Using custom roundedRect for compatibility
  drawRoundedRect(ctx, x - size, y - size, size * 2, size * 2, 5);
  ctx.fill();
  
  // --- Head/Cockpit (Darker detail) ---
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x + (isFacingRight ? 10 : -10), y - 10, 6, 0, Math.PI * 2);
  ctx.fill();

  // --- Thrusters (Visual legs/boosters) ---
  ctx.fillStyle = isBoosted ? "#ffaa00" : "#666";
  const thrusterSize = 5;
  const offset = isFacingRight ? -size : size; // Thruster opposite movement
  ctx.fillRect(x + offset - thrusterSize/2, y + size - thrusterSize/2, thrusterSize, thrusterSize);
  
  // hp bar (relative to the shaken position)
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x - 20, y - 30, 40, 6);

  ctx.fillStyle = "#4cff4c";
  ctx.fillRect(x - 20, y - 30, 40 * (e.hp / e.maxHp), 6);
  
  // --- Visual Effects ---
  if (isShielded) {
    ctx.strokeStyle = "#4dff4d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Helper function for drawing rounded rectangles (since canvas roundRect isn't standard in all environments)
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}


// Draws obstacles with unique world styling
function drawObstacle(ctx: CanvasRenderingContext2D, o: any, playerWorld: World, desyncLevel: number, shakeX: number, shakeY: number) {
    const x = o.x + shakeX;
    const y = o.y + shakeY;
    
    // Desync glitch color
    const desyncFactor = desyncLevel / 100;
    const glowIntensity = 20 * desyncFactor;
    
    ctx.shadowBlur = 0; // Reset shadow before drawing obstacle base
    
    if (playerWorld === 'light') {
        // Space/Metal Obstacles
        ctx.fillStyle = "#9999aa";
        ctx.fillRect(x, y, o.w, o.h);
        
        // Add metallic highlights
        const highlight = ctx.createLinearGradient(x, y, x + o.w, y + o.h);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlight.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = highlight;
        ctx.fillRect(x, y, o.w, o.h);

    } else {
        // Cavern/Crystal Obstacles
        ctx.fillStyle = "#440066"; // Dark base
        
        // Add purple glow/shadow
        ctx.shadowColor = `rgba(255, 0, 255, ${0.5 + desyncFactor * 0.5})`;
        ctx.shadowBlur = 10 + glowIntensity;
        ctx.fillRect(x, y, o.w, o.h);
        
        // Crystal structure detail (Glowy lines)
        ctx.fillStyle = "#ff00ff";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x + 2, y + 2, o.w - 4, 2);
        ctx.fillRect(x + 2, y + o.h - 4, o.w - 4, 2);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Reset shadow
    }
}

// Draws a bullet (with blur/glow)
function drawBullet(ctx: CanvasRenderingContext2D, b: any, shakeX: number, shakeY: number) {
    ctx.beginPath();
    const color = b.world === "light" ? "#fff6d1" : "#b9a7ff";
    ctx.fillStyle = color;
    
    // Set a subtle glow for the bullet
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    
    ctx.save();
    ctx.translate(b.x + shakeX, b.y + shakeY);
    ctx.rotate(Math.atan2(b.vy, b.vx)); 
    ctx.fillRect(-5, -2, 10, 4); 
    ctx.restore();
    
    ctx.shadowBlur = 0; // Reset shadow
}

// PowerUp Render Helper (with pulse)
function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp, shakeX: number, shakeY: number) {
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    const x = p.x + shakeX;
    const y = p.y + shakeY;
    
    let color: string;
    switch(p.type) {
        case "speed": color = "yellow"; break;
        case "heal": color = "lime"; break;
        case "shield": color = "cyan"; break;
        case "damage": color = "red"; break;
        case "invisibility": color = "purple"; break;
        case "slow_trap": color = "gray"; break;
    }
    
    const pulse = Math.sin(Date.now() / 300) * 2 + 10;
    ctx.fillStyle = color;
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// HUD Helper (with text shadow)
function drawHUD(ctx: CanvasRenderingContext2D, player: any, canvas: HTMLCanvasElement, desyncLevel: number) {
    const now = Date.now();
    const isLight = player.world === "light";
    const x = canvas.width - 200;

    // Apply shadow for clean HUD text
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 3;

    ctx.font = "20px Inter";
    ctx.fillStyle = isLight ? "#fff6d1" : "#b9a7ff";
    ctx.fillText(`World: ${player.world.toUpperCase()}`, x, 30);

    ctx.font = "14px Inter";
    ctx.fillStyle = "#fff";
    
    // Shift Cooldown
    const shiftCD = player.dashCooldown - (now - player.lastShift);
    const shiftText = shiftCD > 0 ? `Shift CD: ${(shiftCD / 1000).toFixed(1)}s` : "SHIFT READY";
    ctx.fillText(shiftText, x, 60);

    let y = 80;
    
    if (now < player.shieldUntil) { y += 20; ctx.fillStyle = "cyan"; ctx.fillText(`Shield: ${((player.shieldUntil - now) / 1000).toFixed(1)}s`, x, y); }
    if (now < player.speedBoostUntil) { y += 20; ctx.fillStyle = "yellow"; ctx.fillText(`Speed: ${((player.speedBoostUntil - now) / 1000).toFixed(1)}s`, x, y); }
    if (now < player.damageBoostUntil) { y += 20; ctx.fillStyle = "red"; ctx.fillText(`Dmg Boost: ${((player.damageBoostUntil - now) / 1000).toFixed(1)}s`, x, y); }
    if (now < player.invisibleUntil) { y += 20; ctx.fillStyle = "purple"; ctx.fillText(`Invisible: ${((player.invisibleUntil - now) / 1000).toFixed(1)}s`, x, y); }
    if (now < player.isSlowedUntil) { y += 20; ctx.fillStyle = "gray"; ctx.fillText(`SLOWED: ${((player.isSlowedUntil - now) / 1000).toFixed(1)}s`, x, y); }
    
    // Desync Status
    y += 30;
    ctx.fillStyle = desyncLevel > 70 ? "red" : desyncLevel > 30 ? "orange" : "lime";
    ctx.fillText(`Desync Level: ${desyncLevel.toFixed(0)}%`, x, y);
    
    // Match Stats
    y += 20;
    ctx.fillStyle = "#fff";
    const matchTime = ((now - GameStats.matchStartTime) / 1000).toFixed(1);
    ctx.fillText(`Time: ${matchTime}s`, x, y + 10);
    y += 20;
    ctx.fillText(`P Shifts: ${GameStats.playerWorldShifts} | B Shifts: ${GameStats.botWorldShifts}`, x, y + 10);
    y += 20;
    ctx.fillText(`P Hits: ${GameStats.playerHitsLanded} | B Deaths: ${GameStats.botDeaths}`, x, y + 10);
    
    ctx.shadowBlur = 0; // Reset shadow for the rest of the canvas
}

window.GameClient = { startGame };
export {};