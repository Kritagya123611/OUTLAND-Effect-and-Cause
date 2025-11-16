// apps/game-client/src/main.ts
type World = "light" | "shadow";

export function startGame(canvas: HTMLCanvasElement) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = 800; canvas.height = 600;

  // Player state
  const player: any = {
    x: 120, y: 300,
    vx: 0, vy: 0,
    speed: 220,
    friction: 0.92,
    world: "light" as World,
    lastShift: 0,
    hp: 100, maxHp: 100,
    deadUntil: 0,
    kills: 0, deaths: 0,
    speedBoostUntil: 0
  };

  // input
  const keys = new Set<string>();
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    // SHIFT via Space
    if (e.code === "Space") {
      const now = Date.now();
      if (now - player.lastShift >= 3000 && now > (player.deadUntil || 0)) {
        player.world = player.world === "light" ? "shadow" : "light";
        player.lastShift = now;
        spawnShiftParticles(player.x, player.y, player.world);
        pushEvent({ type: "shift", world: player.world, x: player.x, y: player.y });
        playSfx("shift");
      }
      e.preventDefault();
    }
    // test damage key
    if (k === "k") {
      player.hp -= 30;
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  // attacks (mouse)
  let lastAttack = 0;
  const flashes: Array<{x:number,y:number,t:number,world:World}> = [];
  window.addEventListener("mousedown", () => {
    const now = Date.now();
    if (now - lastAttack < 400 || now < (player.deadUntil || 0)) return;
    lastAttack = now;
    flashes.push({ x: player.x, y: player.y, t: now, world: player.world });
    pushEvent({ type: "attack", x: player.x, y: player.y, world: player.world });
    playSfx("attack");
  });

  // powerups
  const powerups: Array<{id:string,x:number,y:number,type:"speed"|"heal", world:World, spawnAt:number}> = [];
  function spawnPowerup() {
    const world = Math.random() < 0.5 ? "light" : "shadow";
    const type = Math.random() < 0.6 ? "speed" : "heal";
    powerups.push({ id: Math.random().toString(36).slice(2), x: 60 + Math.random()*680, y: 60 + Math.random()*480, type, world, spawnAt: Date.now() });
  }
  setInterval(spawnPowerup, 7000);

  // particles for shift
  const particles: Array<{x:number,y:number,vx:number,vy:number,life:number,world:World}> = [];
  function spawnShiftParticles(x:number,y:number,world:World) {
    for (let i=0;i<18;i++){
      const ang = Math.random()*Math.PI*2;
      const sp = 80 + Math.random()*120;
      particles.push({ x, y, vx: Math.cos(ang)*sp * (0.016+Math.random()*0.03), vy: Math.sin(ang)*sp * (0.016+Math.random()*0.03), life: 400 + Math.random()*300, world});
    }
  }

  // events / replay buffer
  const events: any[] = [];
  function pushEvent(e:any){ events.push({ t: Date.now(), ...e }); if (events.length>3000) events.shift(); }
  (window as any).__GAME_EVENTS__ = events;

  // simple sfx
  function playSfx(name:string){ console.log("SFX", name); }

  // stubbed input queue for server
  const inputQueue: any[] = [];
  function sendInput(inp:any){ inputQueue.push({ t: Date.now(), inp }); /* later: ws.send(...) */ }

  // attack flash cleanup
  function cleanupFlashes(now:number) {
    while (flashes.length && now - flashes[0].t > 400) flashes.shift();
  }

  // main loop
  let lastMs = performance.now();
  function loop() {
    const now = performance.now();
    const dt = (now - lastMs) / 1000;
    lastMs = now;

    // update input -> acceleration
    let ax=0, ay=0;
    if (keys.has("w") || keys.has("arrowup")) ay -= 1;
    if (keys.has("s") || keys.has("arrowdown")) ay += 1;
    if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
    if (keys.has("d") || keys.has("arrowright")) ax += 1;
    const len = Math.hypot(ax, ay) || 1;
    // speed boost effect
    const speedMult = player.speedBoostUntil && Date.now() < player.speedBoostUntil ? 1.6 : 1;
    player.vx += (ax/len) * player.speed * (1/60) * speedMult;
    player.vy += (ay/len) * player.speed * (1/60) * speedMult;

    // apply physics
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.vx *= Math.pow(player.friction, dt*60);
    player.vy *= Math.pow(player.friction, dt*60);

    // clamp
    player.x = Math.max(20, Math.min(canvas.width-20, player.x));
    player.y = Math.max(20, Math.min(canvas.height-20, player.y));

    // simulate flashes decay, particles
    const nowMs = Date.now();
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 16;
      p.vx *= 0.98; p.vy *= 0.98;
      if (p.life <= 0) particles.splice(i,1);
    }

    // pickup powerups
    for (let i=powerups.length-1;i>=0;i--){
      const pu = powerups[i];
      const dx = pu.x - player.x, dy = pu.y - player.y;
      const d = Math.hypot(dx,dy);
      if (d < 28 && pu.world === player.world) {
        if (pu.type === "heal") { player.hp = Math.min(player.maxHp, player.hp + 25); playSfx("pickup_heal"); }
        if (pu.type === "speed") { player.speedBoostUntil = Date.now() + 4000; playSfx("pickup_speed"); }
        pushEvent({ type:"pickup", id:pu.id, typeName: pu.type, world: pu.world, x: pu.x, y: pu.y });
        powerups.splice(i,1);
      }
    }

    // test death
    if (player.hp <= 0 && !player.deadUntil) {
      player.deadUntil = Date.now() + 2000;
      pushEvent({ type:"death", x:player.x, y:player.y });
      playSfx("death");
    }
    if (player.deadUntil && Date.now() > player.deadUntil) {
      player.deadUntil = 0;
      player.hp = player.maxHp;
      player.x = 120; player.y = 300;
      pushEvent({ type:"respawn", x:player.x, y:player.y });
    }

    // send stub input to queue (for future network)
    sendInput({ type: "state", x: player.x, y: player.y, vx: player.vx, vy: player.vy, world: player.world });

    // render
    // background depends on world
    if (player.world === "light") {
      ctx.fillStyle = "#071028"; // deep navy
    } else {
      ctx.fillStyle = "#050019"; // deep purple
    }
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw powerups
    for (const pu of powerups) {
      ctx.beginPath();
      ctx.fillStyle = pu.world === "light" ? (pu.type === "heal" ? "#9ff" : "#ffd36b") : (pu.type === "heal" ? "#bcaaff" : "#ff9fe6");
      ctx.arc(pu.x, pu.y, 10, 0, Math.PI*2);
      ctx.fill();
    }

    // draw player
    if (player.deadUntil) {
      // dead visual
      ctx.fillStyle = "rgba(200,200,200,0.2)";
      ctx.fillRect(player.x-16, player.y-16, 32, 32);
    } else {
      ctx.fillStyle = player.world === "light" ? "#fff6d1" : "#b9a7ff";
      ctx.fillRect(player.x-12, player.y-12, 24, 24);
    }

    // draw attack flashes
    for (const f of flashes) {
      const age = nowMs - f.t;
      if (age < 400) {
        ctx.globalAlpha = 1 - age/400;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 24 + age*0.06, 0, Math.PI*2);
        ctx.fillStyle = f.world === "light" ? "#fff2b0" : "#cfa7ff";
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    cleanupFlashes(nowMs);

    // draw particles
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0.15, Math.min(1, p.life/400));
      ctx.fillStyle = p.world === "light" ? "#fff2b0" : "#cfa7ff";
      ctx.fillRect(p.x-2, p.y-2, 4, 4);
      ctx.globalAlpha = 1;
    }

    // UI: world & cooldown
    ctx.save();
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(`World: ${player.world}`, 12, 20);
    const cRem = Math.max(0, 3000 - (Date.now() - player.lastShift));
    const pct = 1 - cRem/3000;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(12, 28, 120, 10);
    ctx.fillStyle = player.world === "light" ? "#fff6d1" : "#b9a7ff";
    ctx.fillRect(12, 28, 120 * pct, 10);
    ctx.fillStyle = "#fff";
    ctx.fillText(`HP: ${Math.round(player.hp)}/${player.maxHp}`, canvas.width - 220, 24);
    ctx.restore();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// export
export default { startGame };
