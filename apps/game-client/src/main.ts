// ===============================
//   PARALLEL WORLDS — GAME CLIENT
//   Fully rewritten & upgraded
//   Works with window.GameClient
// ===============================

type World = "light" | "shadow";
type Vec2 = { x: number; y: number };

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
  const obstacles = [
    { x: 300, y: 200, w: 80, h: 20 },
    { x: 450, y: 350, w: 120, h: 25 },
  ];

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

  function fireBullet(src: any) {
    const b = {
      x: src.x,
      y: src.y,
      vx: (src === player ? 1 : -1) * 5,
      vy: rand(-0.8, 0.8),
      world: src.world,
      dmg: 15,
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

    // dash (space)
    if (e.code === "Space") {
      const now = Date.now();
      if (now - player.lastShift >= player.dashCooldown) {
        player.world = player.world === "light" ? "shadow" : "light";
        player.lastShift = now;
        addParticles(player.x, player.y, player.world === "light" ? "#fff6d1" : "#b9a7ff");
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
     Collision helper
  ------------------------------------------------------- 
  function collides(x: number, y: number, w: number, h: number) {
    return obstacles.some((o) => x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y);
  }*/

  /* -------------------------------------------------------
     BOT AI LOGIC
  ------------------------------------------------------- */
  function updateBot(dt: number) {
    if (bot.hp <= 0) return;

    // decide action every 600ms
    if (bot.decisionCooldown <= 0) {
      bot.decisionCooldown = 600;

      const d = dist(player, bot);

      if (d < 200) {
        // flee
        bot.vx = (bot.x - player.x) * 0.02;
        bot.vy = (bot.y - player.y) * 0.02;
      } else {
        // chase
        bot.vx = (player.x - bot.x) * 0.015;
        bot.vy = (player.y - bot.y) * 0.015;
      }

      // fire at player
      if (bot.fireCooldown <= 0 && d < 450) {
        fireBullet(bot);
        bot.fireCooldown = 700;
      }

      // world counter-switch
      if (Math.random() < 0.3) {
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

    /* ------------------------------
       Player Movement
    ------------------------------ */
    let ax = 0,
      ay = 0;

    if (keys.has("w")) ay -= 1;
    if (keys.has("s")) ay += 1;
    if (keys.has("a")) ax -= 1;
    if (keys.has("d")) ax += 1;

    const len = Math.hypot(ax, ay) || 1;
    player.vx = (ax / len) * player.speed * dt;
    player.vy = (ay / len) * player.speed * dt;

    player.x += player.vx * 60 * dt;
    player.y += player.vy * 60 * dt;

    /* ------------------------------
       Bot AI
    ------------------------------ */
    updateBot(dt);

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

      // hit player
      if (b.owner === "bot" && dist(b, player) < 22) {
        if (Date.now() > player.shieldUntil) player.hp -= b.dmg;
        addParticles(player.x, player.y, "#ff8080");
        bullets.splice(i, 1);
        continue;
      }

      // hit bot
      if (b.owner === "player" && dist(b, bot) < 22) {
        bot.hp -= b.dmg;
        addParticles(bot.x, bot.y, "#80ff80");
        bullets.splice(i, 1);
        continue;
      }
    }

    /* ------------------------------
       Death + Respawn
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
    }

    if (bot.hp <= 0) {
      pushKill("You defeated the Bot!");
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
    ctx.fillStyle = player.world === "light" ? "#091738" : "#130024";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw obstacles
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.w, o.h));

    // draw bullets
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.fillStyle = b.world === "light" ? "#fff6d1" : "#b9a7ff";
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // draw entities
    drawEntity(ctx, player, player.world === "light" ? "#fff6d1" : "#b9a7ff");
    drawEntity(ctx, bot, bot.world === "light" ? "#ff9999" : "#cc66ff");

    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0.1, p.life / 300);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

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
function drawEntity(ctx: CanvasRenderingContext2D, e: any, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(e.x, e.y, 18, 0, Math.PI * 2);
  ctx.fill();

  // hp bar
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(e.x - 20, e.y - 30, 40, 6);

  ctx.fillStyle = "#4cff4c";
  ctx.fillRect(e.x - 20, e.y - 30, 40 * (e.hp / e.maxHp), 6);
}

/* -------------------------------------------------------
   EXPOSE TO WINDOW
------------------------------------------------------- */
window.GameClient = { startGame };

export {};
