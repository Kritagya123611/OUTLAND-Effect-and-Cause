// apps/game-client/src/main.ts
type World = "light" | "shadow";
type Vec2 = { x: number; y: number };

// NEW: Define PowerUp type
interface PowerUp {
  x: number;
  y: number;
  world: World;
  type: "speed" | "heal" | "shield" | "damage" | "invisibility" | "slow_trap";
  activeUntil: number; // For non-trap/non-instant pickups
}

declare global {
  interface Window {
    GameClient?: any;
  }
}

/* -------------------------------------------------------
  Utility
------------------------------------------------------- */
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

/* -------------------------------------------------------
  Main Entry
------------------------------------------------------- */
function startGame(canvas: HTMLCanvasElement) {
    // NEW: Background images for each world
const bgLight = new Image();
bgLight.src = "/assets/cave_bg.jpg";   // put your file path

const bgShadow = new Image();
bgShadow.src = "/assets/space_bg.jpg"; // put your file path

  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = 800;
  canvas.height = 600;

  /* -------------------------------------------------------
    PLAYER
  ------------------------------------------------------- */
  const player = {
    x: 200,
    y: 300,
    vx: 0,
    vy: 0,
    speed: 220,
    world: "light" as World,
    hp: 100,
    maxHp: 100,
    lastShift: 0,
    dashCooldown: 3000,
    deadUntil: 0,
    shieldUntil: 0,
    speedBoostUntil: 0,
    damageBoostUntil: 0, // NEW: Damage boost
    invisibleUntil: 0, // NEW: Invisibility
    baseDamage: 15, // NEW: Base damage for calculations
    currentDamage: 15, // NEW: Current damage
    isSlowedUntil: 0, // NEW: Slow trap effect
  };

  /* -------------------------------------------------------
    BOT — Smart AI
  ------------------------------------------------------- */
  const bot = {
    x: 600,
    y: 300,
    vx: 0,
    vy: 0,
    world: "shadow" as World,
    hp: 100,
    maxHp: 100,
    fireCooldown: 0,
    decisionCooldown: 0,
  };

  /* -------------------------------------------------------
    Obstacles
  ------------------------------------------------------- */
  // NEW: Define obstacles with a world property
  const obstacles: { x: number; y: number; w: number; h: number; world?: World }[] = [
    // Neutral Obstacles (exist in both)
    { x: 300, y: 200, w: 80, h: 20 },
    { x: 450, y: 350, w: 120, h: 25 },
    // Light World Exclusive Obstacles (more open light world)
    { x: 100, y: 100, w: 30, h: 150, world: "shadow" }, // Blocks Shadow World path
    { x: 650, y: 50, w: 150, h: 30, world: "shadow" }, // Blocks Shadow World path
    // Shadow World Exclusive Obstacles (more narrow shadow world)
    { x: 150, y: 400, w: 100, h: 30, world: "light" }, // Blocks Light World path
    { x: 500, y: 100, w: 30, h: 100, world: "light" }, // Blocks Light World path
  ];

  function collides(x: number, y: number, w: number, h: number, targetWorld: World) {
    return obstacles.some((o) => {
        // Check if the obstacle exists in the target world
        const existsInTargetWorld = !o.world || o.world === targetWorld;
        if (!existsInTargetWorld) return false;

        // Check for collision
        return x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y;
    });
  }

  /* -------------------------------------------------------
    Power-Ups
  ------------------------------------------------------- */
  const powerups: PowerUp[] = [];
  let powerupSpawnCooldown = 0; // NEW: Cooldown timer

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

    // Only spawn if no existing powerup is too close AND not inside an obstacle in its world
    if (powerups.some(p => dist({x,y}, p) < 50) || collides(x, y, 10, 10, world)) {
        return;
    }
    
    powerups.push({ x, y, world, type, activeUntil: 0 });
  }

  /* -------------------------------------------------------
    Particles
  ------------------------------------------------------- */
  const particles: any[] = [];

  function addParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      particles.push({
        x,
        y,
        vx: rand(-2, 2),
        vy: rand(-2, 2),
        life: rand(150, 300),
        color,
      });
    }
  }

  /* -------------------------------------------------------
    Projectiles
  ------------------------------------------------------- */
  const bullets: any[] = [];

  function fireBullet(src: typeof player | typeof bot) {
    const dmg = src === player ? player.currentDamage : 15; // Use currentDamage for player
    const b = {
      x: src.x,
      y: src.y,
      vx: (src === player ? 1 : -1) * 5,
      vy: rand(-0.8, 0.8),
      world: src.world,
      dmg: dmg, // NEW: Use calculated damage
      owner: src === player ? "player" : "bot",
    };
    bullets.push(b);
  }

  /* -------------------------------------------------------
    Kill Feed
  ------------------------------------------------------- */
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

    // SHIFT (space) - Now correctly handles the `SHIFT` action as a core feature
    if (e.code === "Space") {
      const now = Date.now();
      if (now - player.lastShift >= player.dashCooldown) {
        player.world = player.world === "light" ? "shadow" : "light";
        player.lastShift = now;
        // NEW: Play sound and add particles for the impressive shift effect
        addParticles(player.x, player.y, player.world === "light" ? "#fff6d1" : "#b9a7ff");
        // TODO: Solana Integration #6: Send a small transaction for SHIFT action here.
      }
    }
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  // mouse fire
  window.addEventListener("mousedown", () => {
    if (player.deadUntil) return;
    fireBullet(player);
  });

  /* -------------------------------------------------------
    BOT AI LOGIC
  ------------------------------------------------------- */
  function updateBot(dt: number) {
    if (bot.hp <= 0) return;

    // decide action every 600ms
    if (bot.decisionCooldown <= 0) {
      bot.decisionCooldown = 600;

      const d = dist(player, bot);

      // AI movement logic (flee/chase)
      if (d < 200) {
        // flee
        bot.vx = (bot.x - player.x) * 0.02;
        bot.vy = (bot.y - player.y) * 0.02;
      } else {
        // chase
        bot.vx = (player.x - bot.x) * 0.015;
        bot.vy = (player.y - bot.y) * 0.015;
      }
      
      // NEW: Avoid obstacles in current world (simple collision check)
      const nextX = bot.x + bot.vx * dt * 60;
      const nextY = bot.y + bot.vy * dt * 60;
      if (collides(nextX - 18, nextY - 18, 36, 36, bot.world)) {
        bot.vx *= -1; // Simple reverse direction
        bot.vy *= -1;
      }

      // fire at player
      if (bot.fireCooldown <= 0 && d < 450) {
        // NEW: Bot only fires if the player is in the same world AND not invisible
        if (player.world === bot.world && Date.now() > player.invisibleUntil) {
            fireBullet(bot);
            bot.fireCooldown = 700;
        }
      }

      // world counter-switch (Predictive)
      // NEW: Bot is more likely to switch if player is about to hit it with a bullet
      const playerBulletCount = bullets.filter(b => b.owner === 'player' && b.world === bot.world).length;
      if (playerBulletCount > 0 || (Math.random() < 0.3 && player.world !== bot.world)) {
        bot.world = bot.world === "light" ? "shadow" : "light";
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

    // NEW: Update cooldowns and effects
    player.currentDamage = Date.now() < player.damageBoostUntil ? player.baseDamage * 2 : player.baseDamage;
    const isSlowed = Date.now() < player.isSlowedUntil;
    const currentSpeed = player.speed * (Date.now() < player.speedBoostUntil ? 1.5 : 1) * (isSlowed ? 0.5 : 1);
    
    // NEW: Powerup Spawning
    powerupSpawnCooldown -= dt * 1000;
    if (powerupSpawnCooldown <= 0 && powerups.length < 5) {
        spawnPowerUp();
        powerupSpawnCooldown = rand(2000, 5000);
    }

    /* ------------------------------
      Player Movement
    ------------------------------ */
    let ax = 0, ay = 0;

    if (keys.has("w")) ay -= 1;
    if (keys.has("s")) ay += 1;
    if (keys.has("a")) ax -= 1;
    if (keys.has("d")) ax += 1;

    const len = Math.hypot(ax, ay) || 1;
    player.vx = (ax / len) * currentSpeed * dt; // Use currentSpeed
    player.vy = (ay / len) * currentSpeed * dt; // Use currentSpeed

    const nextX = player.x + player.vx * 60 * dt;
    const nextY = player.y + player.vy * 60 * dt;
    
    // NEW: Collision with world-specific obstacles
    if (!collides(nextX - 18, player.y - 18, 36, 36, player.world)) {
        player.x = nextX;
    }
    if (!collides(player.x - 18, nextY - 18, 36, 36, player.world)) {
        player.y = nextY;
    }

    /* ------------------------------
      Bot AI
    ------------------------------ */
    updateBot(dt);

    /* ------------------------------
      Power-Up Collection
    ------------------------------ */
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (dist(p, player) < 25) {
            if (p.world !== player.world) continue; // Can only pick up in your current world

            let msg = `Picked up ${p.type} in ${p.world} world.`;
            const now = Date.now();
            const duration = 3000; // 3 seconds base duration

            switch (p.type) {
                case "speed":
                    player.speedBoostUntil = now + duration;
                    msg = "Speed boost activated!";
                    break;
                case "heal":
                    player.hp = Math.min(player.maxHp, player.hp + 25);
                    msg = "Healed 25 HP!";
                    break;
                case "shield":
                    player.shieldUntil = now + duration;
                    msg = "Shield activated!";
                    break;
                case "damage":
                    player.damageBoostUntil = now + duration;
                    msg = "Damage boost activated!";
                    break;
                case "invisibility":
                    player.invisibleUntil = now + 1000; // 1 second sneak attack
                    msg = "Temporary invisibility!";
                    break;
                case "slow_trap":
                    if (player.world === "shadow") { // Only traps work in shadow world for this
                        player.isSlowedUntil = now + duration;
                        msg = "You hit a SLOW TRAP!";
                    } else {
                        // Traps don't typically help the player, so you could make them a hazard in the Shadow World. 
                        // For now, only the player world check is enough to prevent accidental pickup
                    }
                    break;
            }

            addParticles(p.x, p.y, p.world === "light" ? "#fff6d1" : "#b9a7ff");
            pushKill(msg);
            powerups.splice(i, 1);
        }
    }
    
    /* ------------------------------
      Update Bullets
    ------------------------------ */
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * 4;
      b.y += b.vy * 4;

      // out of bounds
      if (b.x < 0 || b.x > canvas.width) {
        bullets.splice(i, 1);
        continue;
      }
      
      // NEW: Bullet collision with world-specific obstacles
      if (collides(b.x - 5, b.y - 5, 10, 10, b.world)) {
        addParticles(b.x, b.y, "rgba(255,255,255,0.5)");
        bullets.splice(i, 1);
        continue;
      }

      // hit player
      if (b.owner === "bot" && player.world === b.world && dist(b, player) < 22) {
        if (Date.now() > player.shieldUntil) player.hp -= b.dmg;
        else pushKill("Shield blocked damage!");
        addParticles(player.x, player.y, "#ff8080");
        bullets.splice(i, 1);
        continue;
      }

      // hit bot
      if (b.owner === "player" && bot.world === b.world && dist(b, bot) < 22) {
        bot.hp -= b.dmg;
        addParticles(bot.x, bot.y, "#80ff80");
        bullets.splice(i, 1);
        continue;
      }
    }

    /* ------------------------------
      Death + Respawn (No Change)
    ------------------------------ */
    if (player.hp <= 0 && !player.deadUntil) {
      player.deadUntil = now + 2000;
      pushKill("Bot eliminated you!");
    }
    if (player.deadUntil && now > player.deadUntil) {
      player.deadUntil = 0;
      player.hp = player.maxHp;
      player.x = 200;
      player.y = 300;
      // NEW: Reset temporary effects on death/respawn
      player.shieldUntil = 0;
      player.speedBoostUntil = 0;
      player.damageBoostUntil = 0;
      player.invisibleUntil = 0;
      player.isSlowedUntil = 0;
    }

    if (bot.hp <= 0) {
      pushKill("You defeated the Bot!");
      // TODO: Solana Integration #4 & #5: On-Chain Match Record and Shard NFT Reward here.
      bot.hp = bot.maxHp;
      bot.x = 600;
      bot.y = 300;
    }

    /* ------------------------------
      Update particles
    ------------------------------ */
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
    const bg = player.world === "light" ? bgLight : bgShadow;
ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);


    // draw obstacles
    obstacles.forEach((o) => {
        // Only draw obstacles in the player's current world or neutral ones
        if (!o.world || o.world === player.world) {
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fillRect(o.x, o.y, o.w, o.h);
        }
    });

    // draw powerups
    powerups.forEach((p) => {
        if (p.world === player.world) { // Only draw powerups visible in the current world
            drawPowerUp(ctx, p);
        }
    });

    // draw bullets
    bullets.forEach((b) => {
        if (b.world === player.world) { // Only draw bullets visible in the current world
            ctx.beginPath();
            ctx.fillStyle = b.world === "light" ? "#fff6d1" : "#b9a7ff";
            ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // draw entities
    // NEW: Player visibility (only draw bot if player can see it)
    if (Date.now() > player.invisibleUntil) {
        drawEntity(ctx, player, player.world === "light" ? "#fff6d1" : "#b9a7ff", Date.now() < player.shieldUntil, Date.now() < player.speedBoostUntil);
    } else {
        // Player is invisible, draw a faint ghost for debugging/UX
        drawEntity(ctx, player, "rgba(255, 255, 255, 0.2)", false, false);
    }
    
    // NEW: Bot visibility (only draw bot if player can see it AND it's in the same world)
    if (bot.world === player.world) {
        drawEntity(ctx, bot, bot.world === "light" ? "#ff9999" : "#cc66ff", false, false);
    }
    
    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0.1, p.life / 300);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // HUD / Status text
    drawHUD(ctx, player, canvas);

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
  Render helper
------------------------------------------------------- */
function drawEntity(ctx: CanvasRenderingContext2D, e: any, color: string, isShielded: boolean, isBoosted: boolean) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(e.x, e.y, 18, 0, Math.PI * 2);
  ctx.fill();

  if (isShielded) {
    ctx.strokeStyle = "#4dff4d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (isBoosted) {
    ctx.strokeStyle = "#fff6d1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.x - 10, e.y + 20);
    ctx.lineTo(e.x, e.y + 30);
    ctx.lineTo(e.x + 10, e.y + 20);
    ctx.stroke();
  }

  // hp bar
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(e.x - 20, e.y - 30, 40, 6);

  ctx.fillStyle = "#4cff4c";
  ctx.fillRect(e.x - 20, e.y - 30, 40 * (e.hp / e.maxHp), 6);
}

// NEW: PowerUp Render Helper
function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp) {
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);

    switch(p.type) {
        case "speed": ctx.fillStyle = "yellow"; break;
        case "heal": ctx.fillStyle = "lime"; break;
        case "shield": ctx.fillStyle = "cyan"; break;
        case "damage": ctx.fillStyle = "red"; break;
        case "invisibility": ctx.fillStyle = "purple"; break;
        case "slow_trap": ctx.fillStyle = "gray"; break;
    }
    ctx.fill();
    ctx.globalAlpha = 1;
}

// NEW: HUD Helper
function drawHUD(ctx: CanvasRenderingContext2D, player: any, canvas: HTMLCanvasElement) {
    const now = Date.now();
    const isLight = player.world === "light";
    const x = canvas.width - 200;

    ctx.font = "20px Inter";
    ctx.fillStyle = isLight ? "#fff6d1" : "#b9a7ff";
    ctx.fillText(`World: ${player.world.toUpperCase()}`, x, 30);

    ctx.font = "14px Inter";
    ctx.fillStyle = "#fff";
    
    // Shift Cooldown
    const shiftCD = player.dashCooldown - (now - player.lastShift);
    const shiftText = shiftCD > 0 ? `Shift CD: ${(shiftCD / 1000).toFixed(1)}s` : "SHIFT READY";
    ctx.fillText(shiftText, x, 60);

    // Active Effects
    let y = 80;
    if (now < player.shieldUntil) {
        ctx.fillStyle = "cyan";
        ctx.fillText(`Shield: ${((player.shieldUntil - now) / 1000).toFixed(1)}s`, x, y);
        y += 20;
    }
    if (now < player.speedBoostUntil) {
        ctx.fillStyle = "yellow";
        ctx.fillText(`Speed: ${((player.speedBoostUntil - now) / 1000).toFixed(1)}s`, x, y);
        y += 20;
    }
    if (now < player.damageBoostUntil) {
        ctx.fillStyle = "red";
        ctx.fillText(`Dmg Boost: ${((player.damageBoostUntil - now) / 1000).toFixed(1)}s`, x, y);
        y += 20;
    }
    if (now < player.invisibleUntil) {
        ctx.fillStyle = "purple";
        ctx.fillText(`Invisible: ${((player.invisibleUntil - now) / 1000).toFixed(1)}s`, x, y);
        y += 20;
    }
    if (now < player.isSlowedUntil) {
        ctx.fillStyle = "gray";
        ctx.fillText(`SLOWED: ${((player.isSlowedUntil - now) / 1000).toFixed(1)}s`, x, y);
        y += 20;
    }
    
    ctx.fillStyle = "#fff";
    ctx.fillText(`Damage: ${player.currentDamage}`, x, y + 10);
}

window.GameClient = { startGame };
export {};